-- ============================================================================
-- COMPLETE DATABASE SETUP FOR SMART STUDY BUDDY
-- Run this ONCE in Supabase SQL Editor to set up everything
-- ============================================================================

-- Step 1: Create profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  preferred_times TEXT[] DEFAULT ARRAY['evening'],
  session_duration INT DEFAULT 60,
  reminder_advance INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create assignments table with NEW columns included
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('exam','essay','presentation','quiz')) DEFAULT 'exam',
  exam_subtype TEXT CHECK (exam_subtype IN ('theoretical','practical','hybrid','quiz')) DEFAULT 'hybrid',
  due_at TIMESTAMPTZ NOT NULL,
  topics TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming',
  materials_uploaded BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  materials_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Create other tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INT DEFAULT 60,
  topics TEXT[] DEFAULT '{}',
  focus TEXT DEFAULT 'concepts',
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INT DEFAULT 3,
  payload JSONB NOT NULL,
  user_answer JSONB,
  is_correct BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  topic_mastery JSONB DEFAULT '{}',
  overall_readiness INT DEFAULT 0,
  weak_topics TEXT[] DEFAULT '{}',
  strong_topics TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, assignment_id)
);

-- Step 4: Add new columns to assignments if table already existed
-- ============================================================================
DO $$
BEGIN
  -- Add columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='assignments' AND column_name='materials_uploaded') THEN
    ALTER TABLE public.assignments ADD COLUMN materials_uploaded BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='assignments' AND column_name='notification_sent') THEN
    ALTER TABLE public.assignments ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='assignments' AND column_name='notification_sent_at') THEN
    ALTER TABLE public.assignments ADD COLUMN notification_sent_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='assignments' AND column_name='materials_uploaded_at') THEN
    ALTER TABLE public.assignments ADD COLUMN materials_uploaded_at TIMESTAMPTZ;
  END IF;
END $$;

-- Step 5: Enable Row Level Security
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
-- ============================================================================

-- Profiles policies - IMPORTANT: Allow backend to read profiles!
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to read profiles by email" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- CRITICAL: Allow backend (anon key) to read profiles by email
CREATE POLICY "Allow anon to read profiles by email"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Assignments policies
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;
CREATE POLICY "Users can manage own assignments"
  ON public.assignments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Study sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.study_sessions;
CREATE POLICY "Users can manage own sessions"
  ON public.study_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Exercises policies
DROP POLICY IF EXISTS "Users can manage own exercises" ON public.exercises;
CREATE POLICY "Users can manage own exercises"
  ON public.exercises FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- User progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 7: Create indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON public.assignments(due_at);
CREATE INDEX IF NOT EXISTS idx_assignments_notification_pending
  ON public.assignments(notification_sent, created_at)
  WHERE notification_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_scheduled_at ON public.study_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON public.exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- Step 8: Create function and trigger for auto-creating profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create profiles for any existing auth users
-- ============================================================================
INSERT INTO public.profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 10: Add column comments
-- ============================================================================
COMMENT ON COLUMN public.assignments.materials_uploaded IS 'Tracks whether user has uploaded study materials for this assignment';
COMMENT ON COLUMN public.assignments.notification_sent IS 'Tracks whether email notification was sent to user about this assignment';

-- Step 11: Verify setup
-- ============================================================================
SELECT
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.assignments) as total_assignments,
  (SELECT
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='assignments' AND column_name='materials_uploaded'
      ) THEN 'YES'
      ELSE 'NO'
    END
  ) as materials_column_exists,
  (SELECT
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='profiles' AND policyname='Allow anon to read profiles by email'
      ) THEN 'YES'
      ELSE 'NO'
    END
  ) as backend_policy_exists;
