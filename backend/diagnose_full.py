#!/usr/bin/env python3
"""
Diagnostic script to check what's actually in Supabase
Run this to see if assignments exist and why they might not be visible
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

print("="*80)
print("🔍 SUPABASE DATABASE DIAGNOSTIC")
print("="*80)

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Check profiles
    print("\n👤 Checking Profiles...")
    profiles = client.table('profiles').select('id, email').execute()
    print(f"   Total profiles: {len(profiles.data)}")

    if profiles.data:
        for profile in profiles.data:
            print(f"   • {profile['email']}")
            print(f"     User ID: {profile['id']}")
            user_id = profile['id']
    else:
        print("   ❌ NO PROFILES FOUND!")
        print("   You need to sign up at http://localhost:8080/auth first!")
        exit(1)

    # Check assignments
    print("\n📚 Checking Assignments...")
    assignments = client.table('assignments').select('id, title, user_id, materials_uploaded, notification_sent, created_at').execute()
    print(f"   Total assignments: {len(assignments.data)}")

    if assignments.data:
        print("\n   Assignments in database:")
        for i, assignment in enumerate(assignments.data[:15], 1):  # Show first 15
            print(f"\n   {i}. {assignment['title']}")
            print(f"      ID: {assignment['id']}")
            print(f"      User ID: {assignment['user_id']}")
            print(f"      Materials uploaded: {assignment['materials_uploaded']}")
            print(f"      Notification sent: {assignment['notification_sent']}")
            print(f"      Created: {assignment['created_at']}")

            # Check if user_id matches
            if assignment['user_id'] == user_id:
                print(f"      ✅ User ID matches!")
            else:
                print(f"      ❌ User ID MISMATCH! Assignment belongs to: {assignment['user_id']}")

        if len(assignments.data) > 15:
            print(f"\n   ... and {len(assignments.data) - 15} more assignments")

        # Test if we can access one assignment
        print("\n🧪 Testing Assignment Access...")
        test_id = assignments.data[0]['id']
        print(f"   Trying to fetch assignment: {test_id}")

        try:
            test_result = client.table('assignments').select('*').eq('id', test_id).single().execute()
            if test_result.data:
                print(f"   ✅ Can access assignment via anon key!")
            else:
                print(f"   ⚠️  Empty result when fetching assignment")
        except Exception as e:
            print(f"   ❌ ERROR accessing assignment: {e}")
            print(f"   This means RLS policies are blocking access!")
            print(f"\n   🔧 FIX: Run FIX_FRONTEND_RLS.sql in Supabase SQL Editor")

    else:
        print("   ❌ NO ASSIGNMENTS FOUND!")
        print("   The sync created them but they're not in Supabase")
        print("   This could be a database connection issue")

    # Check RLS policies
    print("\n🔒 Checking RLS Policies...")
    try:
        # This query checks if RLS is enabled
        result = client.table('assignments').select('count').execute()
        print(f"   ✅ Can query assignments table (RLS allows SELECT)")
    except Exception as e:
        print(f"   ❌ Cannot query assignments: {e}")

    print("\n" + "="*80)
    print("📋 SUMMARY")
    print("="*80)

    if len(profiles.data) > 0 and len(assignments.data) > 0:
        print("✅ Profiles exist")
        print(f"✅ {len(assignments.data)} assignments exist in database")
        print("\nIf email links show 'Assignment not found':")
        print("1. Run FIX_FRONTEND_RLS.sql in Supabase SQL Editor")
        print("2. Clear browser cache (F12 → Application → Clear site data)")
        print("3. Log out and log back in")
        print("4. Try clicking email link again")

        print(f"\nTest URL (try this in browser while logged in):")
        print(f"http://localhost:8080/assignments/{assignments.data[0]['id']}")
    elif len(profiles.data) == 0:
        print("❌ No profiles - Sign up at http://localhost:8080/auth first")
    elif len(assignments.data) == 0:
        print("❌ No assignments - Run sync again")

    print("="*80)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
