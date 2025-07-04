
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for crowd levels
CREATE TYPE crowd_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for user roles
CREATE TYPE user_role_enum AS ENUM ('admin', 'operator', 'viewer');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role user_role_enum DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing zones table
ALTER TABLE public.zones 
  ALTER COLUMN crowd_level TYPE crowd_level_enum USING crowd_level::crowd_level_enum,
  ADD COLUMN IF NOT EXISTS location_coordinates POINT,
  ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create historical crowd data table
CREATE TABLE public.crowd_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  crowd_level crowd_level_enum NOT NULL,
  crowd_count INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  weather_conditions TEXT
);

-- Create emergency logs table
CREATE TABLE public.emergency_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create analytics reports table
CREATE TABLE public.analytics_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE
);

-- Create crowd predictions table for ML models
CREATE TABLE public.crowd_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  predicted_level crowd_level_enum NOT NULL,
  predicted_count INTEGER,
  prediction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_time TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score DECIMAL(3,2),
  model_version TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for zones (viewable by authenticated users)
CREATE POLICY "Authenticated users can view zones" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and operators can modify zones" ON public.zones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create RLS policies for crowd_history
CREATE POLICY "Authenticated users can view crowd history" ON public.crowd_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and operators can insert crowd history" ON public.crowd_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create RLS policies for emergency_logs
CREATE POLICY "Authenticated users can view emergency logs" ON public.emergency_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create emergency logs" ON public.emergency_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins and operators can update emergency logs" ON public.emergency_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create RLS policies for analytics_reports
CREATE POLICY "Authenticated users can view analytics reports" ON public.analytics_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and operators can create analytics reports" ON public.analytics_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create RLS policies for crowd_predictions
CREATE POLICY "Authenticated users can view crowd predictions" ON public.crowd_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crowd predictions" ON public.crowd_predictions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for all tables
ALTER TABLE public.zones REPLICA IDENTITY FULL;
ALTER TABLE public.crowd_history REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_logs REPLICA IDENTITY FULL;
ALTER TABLE public.analytics_reports REPLICA IDENTITY FULL;
ALTER TABLE public.crowd_predictions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create indexes for better performance
CREATE INDEX idx_crowd_history_zone_timestamp ON public.crowd_history(zone_id, timestamp DESC);
CREATE INDEX idx_emergency_logs_zone_timestamp ON public.emergency_logs(zone_id, timestamp DESC);
CREATE INDEX idx_crowd_predictions_zone_target ON public.crowd_predictions(zone_id, target_time);
CREATE INDEX idx_analytics_reports_type_created ON public.analytics_reports(report_type, created_at DESC);
