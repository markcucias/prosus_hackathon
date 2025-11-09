#!/usr/bin/env python3
"""
Diagnose and fix user profile issues.
This script checks if the user profile exists and helps fix any issues.
"""

import requests
import os

# Configuration
USER_EMAIL = 'doe839319@gmail.com'
SUPABASE_URL = 'https://lcpexhkqaqftaqdtgebp.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY'

print("="*70)
print("🔍 USER PROFILE DIAGNOSTIC TOOL")
print("="*70)
print(f"\nLooking for user: {USER_EMAIL}")
print(f"Supabase URL: {SUPABASE_URL}")

# Test 1: Check if we can access Supabase at all
print("\n" + "-"*70)
print("TEST 1: Checking Supabase connectivity...")
print("-"*70)

try:
    health_url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    }
    response = requests.get(health_url, headers=headers)
    print(f"✅ Supabase is reachable (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Cannot reach Supabase: {e}")
    exit(1)

# Test 2: Try to query profiles table
print("\n" + "-"*70)
print("TEST 2: Checking if profiles table exists and is accessible...")
print("-"*70)

try:
    profiles_url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {'select': 'id,email', 'limit': '1'}
    response = requests.get(profiles_url, headers=headers, params=params)

    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text[:200]}")

    if response.status_code == 200:
        print("✅ Profiles table exists and is accessible")
    elif response.status_code == 404:
        print("❌ Profiles table does not exist!")
        print("   👉 You need to run COMPLETE_DATABASE_SETUP.sql in Supabase")
    elif response.status_code == 401 or response.status_code == 403:
        print("❌ Access denied to profiles table!")
        print("   👉 RLS policy is blocking access")
        print("   👉 You need to run COMPLETE_DATABASE_SETUP.sql to fix policies")
    else:
        print(f"⚠️  Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error accessing profiles: {e}")

# Test 3: Try to find specific user
print("\n" + "-"*70)
print(f"TEST 3: Looking for user profile: {USER_EMAIL}...")
print("-"*70)

try:
    user_url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {'email': f'eq.{USER_EMAIL}', 'select': 'id,email,full_name'}
    response = requests.get(user_url, headers=headers, params=params)

    print(f"Response status: {response.status_code}")

    if response.status_code == 200:
        users = response.json()
        if users and len(users) > 0:
            user = users[0]
            print(f"✅ USER FOUND!")
            print(f"   ID: {user['id']}")
            print(f"   Email: {user['email']}")
            print(f"   Name: {user.get('full_name', 'Not set')}")
            print("\n🎉 Your profile exists! The backend should work now.")
            print("   If it's still not working, restart the backend: python backend/api.py")
        else:
            print(f"❌ NO USER FOUND with email: {USER_EMAIL}")
            print("\n📋 POSSIBLE CAUSES:")
            print("   1. You haven't signed up yet")
            print("   2. The trigger didn't fire when you signed up")
            print("   3. The database migration wasn't run")
            print("\n🔧 HOW TO FIX:")
            print("   Option A: Sign up again (or use a different browser/incognito)")
            print("   Option B: Run the manual fix below")
    elif response.status_code in [401, 403]:
        print(f"❌ ACCESS DENIED!")
        print(f"   Response: {response.text}")
        print("\n🔧 FIX: The RLS policy is blocking access.")
        print("   You MUST run COMPLETE_DATABASE_SETUP.sql in Supabase!")
    else:
        print(f"⚠️  Unexpected response: {response.status_code}")
        print(f"   Body: {response.text}")

except Exception as e:
    print(f"❌ Error: {e}")

# Test 4: Check auth.users table (this requires service_role key, won't work with anon)
print("\n" + "-"*70)
print("TEST 4: Checking if you have an auth account...")
print("-"*70)
print("⚠️  Cannot check auth.users with anon key (needs service_role)")
print("   Check manually in Supabase Dashboard:")
print("   👉 Go to: Authentication → Users")
print(f"   👉 Look for: {USER_EMAIL}")

# Summary and next steps
print("\n" + "="*70)
print("📋 SUMMARY & NEXT STEPS")
print("="*70)

print("\nIf you see 'ACCESS DENIED' or 'NO USER FOUND' above:")
print("\n1️⃣  Run this SQL in Supabase Dashboard → SQL Editor:")
print("\n" + "-"*70)
print("""
-- Check if user exists in auth.users but not in profiles
SELECT
    u.id,
    u.email,
    CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'doe839319@gmail.com';

-- If user exists in auth.users but not in profiles, create the profile:
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, email
FROM auth.users
WHERE email = 'doe839319@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verify it was created:
SELECT * FROM public.profiles WHERE email = 'doe839319@gmail.com';
""")
print("-"*70)

print("\n2️⃣  If the above shows nothing, you need to:")
print("    a) Run COMPLETE_DATABASE_SETUP.sql first")
print("    b) Then sign up at http://localhost:8080")
print("    c) Then run this diagnostic script again")

print("\n3️⃣  After fixing, restart backend:")
print("    python backend/api.py")

print("\n" + "="*70 + "\n")
