#!/usr/bin/env python3
"""
Reset MongoDB processed flags so assignments can be synced again.
This is useful for testing the email notification flow.
"""

from database import get_database

print("="*70)
print("🔄 RESETTING MONGODB PROCESSED FLAGS")
print("="*70)

try:
    db = get_database()
    collection = db["calendar_events"]

    # Count assignments before reset
    total_assignments = collection.count_documents({'is_assignment': True})
    processed_assignments = collection.count_documents({'is_assignment': True, 'processed': True})

    print(f"\n📊 Current Status:")
    print(f"   Total assignments: {total_assignments}")
    print(f"   Processed assignments: {processed_assignments}")
    print(f"   Unprocessed assignments: {total_assignments - processed_assignments}")

    # Reset processed and reminder_sent flags
    result = collection.update_many(
        {'is_assignment': True},
        {'$set': {
            'processed': False,
            'reminder_sent': False
        }}
    )

    print(f"\n✅ Reset {result.modified_count} assignment(s)")
    print(f"   All assignments are now marked as unprocessed")
    print(f"   Email notifications will be sent again on next sync")

    # Show updated status
    processed_after = collection.count_documents({'is_assignment': True, 'processed': True})
    print(f"\n📊 After Reset:")
    print(f"   Processed assignments: {processed_after}")
    print(f"   Unprocessed assignments: {total_assignments - processed_after}")

    print("\n" + "="*70)
    print("✅ MONGODB RESET COMPLETE!")
    print("="*70)
    print("\nNext steps:")
    print("1. Run CLEAR_DATABASE.sql in Supabase to delete old assignments")
    print("2. Restart the backend: python backend/api.py")
    print("3. Click 'Sync Calendar' in the frontend")
    print("4. Check your email - you should receive notifications!")
    print("="*70 + "\n")

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
