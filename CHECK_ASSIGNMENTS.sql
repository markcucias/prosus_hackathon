-- ============================================================================
-- Quick Check: What's in the database?
-- Run this in Supabase SQL Editor to see assignments and diagnose the issue
-- ============================================================================

-- Step 1: Check if assignments exist
SELECT
    id,
    title,
    user_id,
    materials_uploaded,
    notification_sent,
    created_at
FROM public.assignments
ORDER BY created_at DESC
LIMIT 15;

-- Step 2: Check your user profile
SELECT id, email FROM public.profiles;

-- Step 3: Check if user_id matches
-- This shows if assignments belong to the right user
SELECT
    a.id,
    a.title,
    a.user_id as assignment_user_id,
    p.id as profile_user_id,
    p.email,
    CASE
        WHEN a.user_id = p.id THEN '✅ MATCH'
        ELSE '❌ MISMATCH'
    END as status
FROM public.assignments a
CROSS JOIN public.profiles p
WHERE p.email = 'doe839319@gmail.com'
ORDER BY a.created_at DESC
LIMIT 10;

-- Step 4: Check RLS policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'assignments'
ORDER BY policyname;

-- Step 5: Count everything
SELECT
    (SELECT COUNT(*) FROM public.assignments) as total_assignments,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.study_sessions) as total_sessions;
