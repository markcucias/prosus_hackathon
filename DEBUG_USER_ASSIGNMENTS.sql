-- ============================================================================
-- Debug: Check which assignments belong to which user
-- This will show if the 44 assignments are split across multiple users
-- ============================================================================

-- Step 1: Show all unique user_ids in assignments
SELECT
    user_id,
    COUNT(*) as assignment_count,
    STRING_AGG(title, ', ' ORDER BY created_at DESC) as assignment_titles
FROM public.assignments
GROUP BY user_id;

-- Step 2: Show assignments for the doe839319@gmail.com user specifically
SELECT
    a.id,
    a.title,
    a.created_at,
    a.user_id,
    a.materials_uploaded,
    a.notification_sent
FROM public.assignments a
JOIN public.profiles p ON a.user_id = p.id
WHERE p.email = 'doe839319@gmail.com'
ORDER BY a.created_at DESC;

-- Step 3: Count by user
SELECT
    p.email,
    p.id as profile_id,
    COUNT(a.id) as total_assignments
FROM public.profiles p
LEFT JOIN public.assignments a ON a.user_id = p.id
GROUP BY p.email, p.id;
