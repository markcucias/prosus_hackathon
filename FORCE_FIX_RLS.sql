-- ============================================================================
-- FORCE FIX RLS POLICIES - Drops and recreates everything
-- Run this in Supabase SQL Editor to fix all RLS issues
-- ============================================================================

-- Step 1: Drop ALL existing policies on assignments
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Authenticated users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can view all assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Authenticated users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Authenticated users can delete own assignments" ON public.assignments;

-- Step 2: Drop ALL existing policies on study_sessions
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Backend can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Backend can insert sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Authenticated users can view own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Backend can view all sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Backend can update sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own sessions" ON public.study_sessions;

-- Step 3: Create CORRECT policies for assignments
-- ============================================================================

-- Allow backend (anon key) to INSERT assignments
CREATE POLICY "Backend can insert assignments"
ON public.assignments
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to SELECT their own assignments
CREATE POLICY "Authenticated users can view own assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow backend (anon key) to SELECT any assignment
CREATE POLICY "Backend can view all assignments"
ON public.assignments
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to UPDATE their own assignments
CREATE POLICY "Authenticated users can update own assignments"
ON public.assignments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow backend (anon key) to UPDATE assignments
CREATE POLICY "Backend can update assignments"
ON public.assignments
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE their own assignments
CREATE POLICY "Authenticated users can delete own assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Create CORRECT policies for study_sessions
-- ============================================================================

-- Allow backend (anon key) to INSERT sessions
CREATE POLICY "Backend can insert sessions"
ON public.study_sessions
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to SELECT their own sessions
CREATE POLICY "Authenticated users can view own sessions"
ON public.study_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow backend (anon key) to SELECT any session
CREATE POLICY "Backend can view all sessions"
ON public.study_sessions
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to UPDATE their own sessions
CREATE POLICY "Authenticated users can update own sessions"
ON public.study_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow backend (anon key) to UPDATE sessions
CREATE POLICY "Backend can update sessions"
ON public.study_sessions
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE their own sessions
CREATE POLICY "Authenticated users can delete own sessions"
ON public.study_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Verify setup
SELECT
    '✅ All RLS policies recreated successfully!' as status,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'assignments') as assignment_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'study_sessions') as session_policies;

-- Show the policies
SELECT
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('assignments', 'study_sessions')
ORDER BY tablename, cmd, policyname;
