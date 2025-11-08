-- Fix Backend Access and Add Missing Columns
-- Run this in Supabase SQL Editor to fix all issues at once

-- 1. Add new columns for materials tracking
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS materials_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS materials_uploaded_at TIMESTAMPTZ;

-- 2. Create index for querying assignments needing notification
CREATE INDEX IF NOT EXISTS idx_assignments_notification_pending
ON public.assignments(notification_sent, created_at)
WHERE notification_sent = FALSE;

-- 3. Add comments for documentation
COMMENT ON COLUMN public.assignments.materials_uploaded IS 'Tracks whether user has uploaded study materials for this assignment';
COMMENT ON COLUMN public.assignments.notification_sent IS 'Tracks whether email notification was sent to user about this assignment';

-- 4. Fix RLS policy to allow backend to query profiles
-- This is needed for the agentic AI to find users by email
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anon to read profiles by email" ON public.profiles;

-- Create new policy that allows reading profiles
-- For production: Use service_role key instead of this policy
CREATE POLICY "Allow anon to read profiles by email"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Ensure the trigger exists for auto-creating profiles
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

-- Ensure trigger is set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Display success message
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.assignments) as total_assignments,
  (SELECT COUNT(*) FROM public.assignments WHERE notification_sent = true) as notifications_sent,
  'All fixes applied successfully!' as status;
