-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  household_size INTEGER DEFAULT 2,
  transport_type TEXT DEFAULT 'public', -- 'bike', 'public', 'car', 'walk'
  diet_type TEXT DEFAULT 'mixed', -- 'veg', 'non-veg', 'vegan', 'mixed'
  monthly_electricity INTEGER DEFAULT 200, -- units
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activities table for manual entries
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'transport', 'food', 'shopping', 'energy', 'waste'
  description TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL, -- 'km', 'meals', 'items', 'kwh', 'kg'
  co2_kg DECIMAL NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_co2_reduction INTEGER NOT NULL, -- kg per month
  target_month DATE NOT NULL,
  current_reduction INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  savings_kg INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);

-- Challenges policies (public read, no write)
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT TO authenticated USING (true);

-- User challenges policies
CREATE POLICY "Users can view own challenge participation" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample challenges
INSERT INTO public.challenges (title, description, savings_kg, duration_days, category, icon) VALUES
  ('Veggie Week', 'Go vegetarian for 7 days and reduce your food carbon footprint', 12, 7, 'food', '🥗'),
  ('Walk More Challenge', 'Walk 5km per day instead of using motorized transport', 15, 7, 'transport', '🚶'),
  ('Zero Waste Week', 'Minimize waste generation for a week', 8, 7, 'waste', '♻️'),
  ('Public Transport Month', 'Use only public transport for a month', 45, 30, 'transport', '🚇'),
  ('Meatless Mondays', 'No meat every Monday for a month', 16, 30, 'food', '🌱');