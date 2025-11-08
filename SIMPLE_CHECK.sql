-- ============================================================================
-- Simple User ID Check - Shows if there's a mismatch
-- Run this in Supabase SQL Editor
-- ============================================================================

-- This shows assignments and whether their user_id matches your profile
SELECT
    a.id as assignment_id,
    a.title,
    a.user_id as assignment_user_id,
    p.id as profile_user_id,
    p.email,
    CASE
        WHEN a.user_id = p.id THEN '✅ MATCH - Assignment belongs to you'
        ELSE '❌ MISMATCH - Assignment belongs to different user!'
    END as status
FROM public.assignments a
CROSS JOIN public.profiles p
WHERE p.email = 'doe839319@gmail.com'
ORDER BY a.created_at DESC
LIMIT 5;
