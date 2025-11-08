#!/usr/bin/env python3
"""
Quick script to check what assignments exist in Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials in .env")
    exit(1)

print(f"🔗 Connecting to: {SUPABASE_URL}")

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Check assignments
    result = client.table('assignments').select('id, title, due_at, materials_uploaded, notification_sent').execute()

    print(f"\n📊 Total assignments in Supabase: {len(result.data)}")

    if result.data:
        print("\n📚 Assignments:")
        print("-" * 80)
        for assignment in result.data:
            print(f"  • {assignment['title']}")
            print(f"    ID: {assignment['id']}")
            print(f"    Due: {assignment['due_at']}")
            print(f"    Materials uploaded: {assignment['materials_uploaded']}")
            print(f"    Notification sent: {assignment['notification_sent']}")
            print()
    else:
        print("\n⚠️  No assignments found in Supabase!")
        print("    This explains why they're not showing on the frontend.")

    # Check profiles
    profiles = client.table('profiles').select('id, email').execute()
    print(f"\n👤 Total profiles: {len(profiles.data)}")
    for profile in profiles.data:
        print(f"  • {profile['email']} (ID: {profile['id']})")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
