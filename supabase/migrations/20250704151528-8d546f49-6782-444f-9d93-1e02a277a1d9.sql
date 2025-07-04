
-- Update the zones table to match what the code expects
ALTER TABLE public.zones 
  ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Make sure the emergency_logs table exists with proper structure
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

-- Make sure the profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure the crowd_history table exists
CREATE TABLE IF NOT EXISTS public.crowd_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  crowd_level TEXT NOT NULL,
  crowd_count INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  capacity_percentage DECIMAL(5,2)
);

-- Enable Row Level Security on tables if not already enabled
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emergency_logs if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_logs' AND policyname = 'Authenticated users can view emergency logs') THEN
        CREATE POLICY "Authenticated users can view emergency logs" ON public.emergency_logs FOR SELECT TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_logs' AND policyname = 'Authenticated users can create emergency logs') THEN
        CREATE POLICY "Authenticated users can create emergency logs" ON public.emergency_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Enable real-time for emergency_logs if not already enabled
ALTER TABLE public.emergency_logs REPLICA IDENTITY FULL;

-- Add emergency_logs to realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'emergency_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_logs;
    END IF;
END $$;
