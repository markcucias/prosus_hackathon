-- ============================================================================
-- COMPLETE VERIFICATION - Check if everything is set up correctly
-- Run this in Supabase SQL Editor at: https://lcpexhkqaqftaqdtgebp.supabase.co
-- ============================================================================

-- Step 1: Check if profile exists for doe839319@gmail.com
SELECT
    '1. PROFILE CHECK' as step,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Profile exists'
        ELSE '❌ NO PROFILE - You need to sign up!'
    END as status,
    COUNT(*) as profile_count
FROM public.profiles
WHERE email = 'doe839319@gmail.com';

-- Step 2: Show profile details if it exists
SELECT
    '2. PROFILE DETAILS' as step,
    id as user_id,
    email,
    created_at
FROM public.profiles
WHERE email = 'doe839319@gmail.com';

-- Step 3: Count assignments for this user
SELECT
    '3. ASSIGNMENT COUNT' as step,
    COUNT(a.id) as assignments_for_this_user,
    (SELECT COUNT(*) FROM public.assignments) as total_assignments_in_database
FROM public.profiles p
LEFT JOIN public.assignments a ON a.user_id = p.id
WHERE p.email = 'doe839319@gmail.com'
GROUP BY p.id;

-- Step 4: Show first 10 assignments for this user
SELECT
    '4. YOUR ASSIGNMENTS' as step,
    a.id,
    a.title,
    a.due_at,
    a.created_at
FROM public.profiles p
JOIN public.assignments a ON a.user_id = p.id
WHERE p.email = 'doe839319@gmail.com'
ORDER BY a.created_at DESC
LIMIT 10;

-- Step 5: Check RLS policies
SELECT
    '5. RLS POLICIES' as step,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'assignments';

-- FINAL SUMMARY
SELECT
    'SUMMARY' as step,
    (SELECT COUNT(*) FROM public.profiles WHERE email = 'doe839319@gmail.com') as has_profile,
    (SELECT COUNT(*) FROM public.assignments a JOIN public.profiles p ON a.user_id = p.id WHERE p.email = 'doe839319@gmail.com') as your_assignments,
    (SELECT COUNT(*) FROM public.assignments) as total_assignments;
