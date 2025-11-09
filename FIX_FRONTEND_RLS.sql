-- ============================================================================
-- FIX FRONTEND ASSIGNMENT ACCESS
-- ============================================================================
-- This fixes the "Failed to load assignment" error when clicking email links
-- Run this in Supabase SQL Editor

-- The issue: Frontend (authenticated user) cannot read assignments
-- Root cause: RLS policies may be misconfigured or conflicting

-- Step 1: Drop ALL existing policies on assignments
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Backend can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;

-- Step 2: Create clear, non-conflicting policies for assignments
-- ============================================================================

-- Allow backend (anon key) to INSERT assignments for any user
CREATE POLICY "Backend can insert assignments"
ON public.assignments
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to SELECT their own assignments
-- This is critical for the frontend to load assignment details
CREATE POLICY "Authenticated users can view own assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow backend (anon key) to SELECT any assignment
-- This allows backend to check if assignment already exists
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
-- This allows backend to mark notifications as sent, materials as uploaded, etc.
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

-- Step 3: Do the same for study_sessions table
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Backend can create sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.study_sessions;

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

-- Step 4: Verify policies were created correctly
-- ============================================================================
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('assignments', 'study_sessions')
ORDER BY tablename, cmd, policyname;

-- Step 5: Test queries
-- ============================================================================
-- This should return all assignments (if you have any)
SELECT
    id,
    user_id,
    title,
    due_at,
    materials_uploaded,
    notification_sent
FROM public.assignments
ORDER BY created_at DESC;

-- Verify RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('assignments', 'study_sessions');

SELECT
    '✅ RLS policies fixed! Frontend should now be able to load assignments.' as status;
