#!/usr/bin/env python3
"""
User Setup Helper - Check if user profile exists and provide setup instructions.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

USER_EMAIL = os.getenv('USER_EMAIL', 'doe839319@gmail.com')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://lcpexhkqaqftaqdtgebp.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY')

def check_user_profile():
    """Check if user profile exists in Supabase."""
    print(f"\n🔍 Checking for user profile: {USER_EMAIL}")

    url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {'email': f'eq.{USER_EMAIL}', 'select': 'id,email,full_name'}
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            users = response.json()
            if users and len(users) > 0:
                user = users[0]
                print(f"✅ User profile found!")
                print(f"   User ID: {user['id']}")
                print(f"   Email: {user['email']}")
                print(f"   Name: {user.get('full_name', 'Not set')}")
                return user
            else:
                print(f"❌ No profile found for: {USER_EMAIL}")
                return None
        else:
            print(f"⚠️  Error checking user: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def check_assignments(user_id):
    """Check if user has any assignments."""
    print(f"\n🔍 Checking assignments for user...")

    url = f"{SUPABASE_URL}/rest/v1/assignments"
    params = {'user_id': f'eq.{user_id}', 'select': 'id,title,due_at,materials_uploaded,notification_sent'}
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            assignments = response.json()
            if assignments:
                print(f"✅ Found {len(assignments)} assignment(s):")
                for i, assignment in enumerate(assignments[:5], 1):
                    print(f"\n   {i}. {assignment['title']}")
                    print(f"      Due: {assignment['due_at']}")
                    print(f"      Materials uploaded: {assignment.get('materials_uploaded', 'N/A')}")
                    print(f"      Notification sent: {assignment.get('notification_sent', 'N/A')}")
                if len(assignments) > 5:
                    print(f"\n   ... and {len(assignments) - 5} more")
            else:
                print("⚠️  No assignments found for this user")
            return assignments
        else:
            print(f"⚠️  Could not check assignments: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def print_signup_instructions():
    """Print instructions for signing up."""
    print("\n" + "="*70)
    print("📝 USER SIGNUP REQUIRED")
    print("="*70)
    print("\nYou need to create an account in the Study Companion app.")
    print("\n🚀 SIGNUP STEPS:\n")
    print("1. Open your browser and go to:")
    print("   http://localhost:8080")
    print("\n2. You should see a sign-up/login page")
    print("\n3. Sign up with:")
    print(f"   Email: {USER_EMAIL}")
    print("   Password: h@ckathon!2#")
    print("\n4. After signing up, a profile will be created automatically")
    print("\n5. Run this script again to verify your profile was created")
    print("\n6. Once verified, the agentic AI will:")
    print("   ✅ Sync assignments from your calendar")
    print("   ✅ Send email notifications")
    print("   ✅ Create study sessions")
    print("="*70 + "\n")

def check_mongodb_assignments():
    """Check MongoDB for unprocessed assignments."""
    print("\n🔍 Checking MongoDB for unprocessed assignments...")

    try:
        from database import get_unprocessed_assignments
        unprocessed = get_unprocessed_assignments()

        if unprocessed:
            print(f"✅ Found {len(unprocessed)} unprocessed assignment(s) in calendar:")
            for i, assignment in enumerate(unprocessed[:5], 1):
                print(f"   {i}. {assignment['details']} ({assignment['datetime']})")
            if len(unprocessed) > 5:
                print(f"   ... and {len(unprocessed) - 5} more")
            print("\n   These will sync to Supabase once you create your profile!")
        else:
            print("ℹ️  No unprocessed assignments in MongoDB")
            print("   Run calendar sync to detect assignments from your Google Calendar")

        return unprocessed
    except Exception as e:
        print(f"⚠️  Could not check MongoDB: {e}")
        return []

if __name__ == '__main__':
    print("🚀 Study Companion - User Setup Helper")
    print("="*70)
    print(f"\nConfigured email: {USER_EMAIL}")

    # Check MongoDB first
    mongodb_assignments = check_mongodb_assignments()

    # Check if user profile exists
    user = check_user_profile()

    if user:
        print("\n✅ SUCCESS! Your profile is set up correctly.")

        # Check for assignments
        supabase_assignments = check_assignments(user['id'])

        if mongodb_assignments and not supabase_assignments:
            print("\n⚠️  NOTICE:")
            print(f"   You have {len(mongodb_assignments)} unprocessed assignments in MongoDB")
            print("   but none in Supabase yet.")
            print("\n   💡 The agentic AI will sync these automatically within 5 minutes")
            print("      Or you can manually trigger sync from the web interface")

        print("\n🎉 Everything is ready! The agentic AI is monitoring your calendar.")
        print("   You'll receive email notifications when new assignments are detected.")
    else:
        print_signup_instructions()

        if mongodb_assignments:
            print(f"ℹ️  Note: You have {len(mongodb_assignments)} assignment(s) waiting to sync")
            print("   They will automatically sync once you create your profile\n")
