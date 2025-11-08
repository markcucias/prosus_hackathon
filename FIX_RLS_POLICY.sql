-- ============================================================================
-- FIX RLS POLICY - Allow Backend to Read Profiles
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the "User not found" issue

-- Step 1: Remove ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to read profiles by email" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Step 2: Create a simple policy that allows anon (backend) to read ALL profiles
CREATE POLICY "Backend can read all profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Step 3: Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 5: Verify the policies were created
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test that the policy works by reading a profile
SELECT id, email, full_name
FROM public.profiles
WHERE email = 'doe839319@gmail.com';

-- Expected result: You should see your profile data
-- If you see the profile, the policy is working!

SELECT 'RLS Policy Fix Complete!' as status;
