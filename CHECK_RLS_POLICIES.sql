-- ============================================================================
-- Check Current RLS Policies
-- This shows what policies actually exist and what they allow
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename IN ('assignments', 'study_sessions', 'profiles')
ORDER BY tablename, cmd, policyname;
