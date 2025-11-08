-- ============================================================================
-- CLEAR DATABASE FOR FRESH TESTING
-- ============================================================================
-- Run this in Supabase SQL Editor to delete all assignments and study sessions

-- Step 1: Delete all study sessions
DELETE FROM public.study_sessions;

-- Step 2: Delete all user progress
DELETE FROM public.user_progress;

-- Step 3: Delete all exercises
DELETE FROM public.exercises;

-- Step 4: Delete all assignments
DELETE FROM public.assignments;

-- Step 5: Verify everything is deleted
SELECT
    (SELECT COUNT(*) FROM public.assignments) as total_assignments,
    (SELECT COUNT(*) FROM public.study_sessions) as total_sessions,
    (SELECT COUNT(*) FROM public.exercises) as total_exercises,
    (SELECT COUNT(*) FROM public.user_progress) as total_progress,
    'Database cleared!' as status;

-- NOTE: This does NOT delete calendar events from MongoDB
-- To reset MongoDB processed flags, run this in your backend:
-- python -c "from backend.database import get_database; db = get_database(); db['calendar_events'].update_many({'is_assignment': True}, {'$set': {'processed': False, 'reminder_sent': False}})"
