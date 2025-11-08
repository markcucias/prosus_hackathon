-- ============================================================================
-- FIX: Allow Backend to Create Assignments
-- ============================================================================
-- Run this in Supabase SQL Editor to allow the backend to insert assignments

-- The backend needs to INSERT assignments on behalf of users
-- Current policy only allows authenticated users to insert their own

-- Step 1: Drop existing restrictive policies on assignments
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can create assignments" ON public.assignments;

-- Step 2: Create policies that allow backend operations

-- Allow anon (backend) to INSERT assignments for any user
CREATE POLICY "Backend can create assignments"
ON public.assignments
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to SELECT their own assignments
CREATE POLICY "Users can view own assignments"
ON public.assignments
FOR SELECT
TO authenticated, anon
USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Allow authenticated users to UPDATE their own assignments
CREATE POLICY "Users can update own assignments"
ON public.assignments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to DELETE their own assignments
CREATE POLICY "Users can delete own assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 3: Do the same for study_sessions table
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.study_sessions;

CREATE POLICY "Backend can create sessions"
ON public.study_sessions
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
ON public.study_sessions
FOR SELECT
TO authenticated, anon
USING (auth.uid() = user_id OR auth.role() = 'anon');

CREATE POLICY "Users can update own sessions"
ON public.study_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.study_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Verify policies were created
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('assignments', 'study_sessions')
ORDER BY tablename, policyname;

-- Step 5: Test by checking if backend can read assignments
SELECT COUNT(*) as total_assignments
FROM public.assignments;

SELECT 'RLS policies updated successfully!' as status;
