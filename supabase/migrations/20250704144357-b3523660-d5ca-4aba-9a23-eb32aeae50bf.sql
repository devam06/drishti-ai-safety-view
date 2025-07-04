
-- First, let's check if emergency_logs table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.emergency_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create profiles table for user management with roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crowd_history table for analytics
CREATE TABLE IF NOT EXISTS public.crowd_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  crowd_level TEXT NOT NULL,
  crowd_count INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  capacity_percentage DECIMAL(5,2)
);

-- Update zones table to ensure all required columns exist
ALTER TABLE public.zones 
  ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure Capacity column exists (it should from previous migration)
ALTER TABLE public.zones 
  ADD COLUMN IF NOT EXISTS Capacity INTEGER DEFAULT 1000;

-- Enable Row Level Security on all tables
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emergency_logs
DROP POLICY IF EXISTS "Authenticated users can view emergency logs" ON public.emergency_logs;
CREATE POLICY "Authenticated users can view emergency logs" ON public.emergency_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create emergency logs" ON public.emergency_logs;
CREATE POLICY "Authenticated users can create emergency logs" ON public.emergency_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for crowd_history
DROP POLICY IF EXISTS "Authenticated users can view crowd history" ON public.crowd_history;
CREATE POLICY "Authenticated users can view crowd history" ON public.crowd_history FOR SELECT TO authenticated USING (true);

-- Create RLS policies for zones
DROP POLICY IF EXISTS "Authenticated users can view zones" ON public.zones;
CREATE POLICY "Authenticated users can view zones" ON public.zones FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can modify zones" ON public.zones;
CREATE POLICY "Admins can modify zones" ON public.zones FOR UPDATE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable real-time for all tables
ALTER TABLE public.zones REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_logs REPLICA IDENTITY FULL;
ALTER TABLE public.crowd_history REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_logs_zone_timestamp ON public.emergency_logs(zone_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_history_zone_timestamp ON public.crowd_history(zone_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_zones_status ON public.zones(status);

-- Function to automatically update crowd level based on capacity
CREATE OR REPLACE FUNCTION public.update_crowd_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate capacity percentage
  NEW.crowd_level := CASE 
    WHEN (NEW.current_count::DECIMAL / NULLIF(NEW.Capacity, 0)) >= 0.95 THEN 'critical'
    WHEN (NEW.current_count::DECIMAL / NULLIF(NEW.Capacity, 0)) >= 0.80 THEN 'high'
    WHEN (NEW.current_count::DECIMAL / NULLIF(NEW.Capacity, 0)) >= 0.50 THEN 'medium'
    ELSE 'low'
  END;
  
  NEW.last_updated := NOW();
  
  -- Insert into crowd_history for analytics
  INSERT INTO public.crowd_history (zone_id, crowd_level, crowd_count, capacity_percentage)
  VALUES (NEW.id, NEW.crowd_level, NEW.current_count, 
          (NEW.current_count::DECIMAL / NULLIF(NEW.Capacity, 0)) * 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update crowd level
DROP TRIGGER IF EXISTS update_crowd_level_trigger ON public.zones;
CREATE TRIGGER update_crowd_level_trigger
  BEFORE UPDATE OF current_count ON public.zones
  FOR EACH ROW
  WHEN (OLD.current_count IS DISTINCT FROM NEW.current_count)
  EXECUTE FUNCTION public.update_crowd_level();
