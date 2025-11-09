-- Fix user_progress table RLS policies
-- RLS is enabled but no policies exist, causing 406 errors

-- Drop any existing policies first
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;

-- Allow authenticated users to view their own progress
CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own progress
CREATE POLICY "Users can insert own progress"
ON public.user_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own progress
CREATE POLICY "Users can update own progress"
ON public.user_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own progress
CREATE POLICY "Users can delete own progress"
ON public.user_progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
