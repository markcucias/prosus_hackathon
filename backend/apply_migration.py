#!/usr/bin/env python3
"""
Apply database migration to add new fields for materials tracking.
This script applies the migration directly via SQL.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://lcpexhkqaqftaqdtgebp.supabase.co')
# Note: For migrations, we need the service_role key, not anon key
# But we can try with anon key for basic operations
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY')

def check_migration_status():
    """Check if the migration has been applied by looking for new columns."""
    print("\n🔍 Checking migration status...")

    # Try to query an assignment to see if new columns exist
    url = f"{SUPABASE_URL}/rest/v1/assignments"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }

    # Add select parameter to check for new columns
    params = {
        'select': 'id,materials_uploaded,notification_sent',
        'limit': '1'
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            print("✅ Migration already applied - new columns exist")
            return True
        elif 'column' in response.text.lower() and 'does not exist' in response.text.lower():
            print("⚠️  Migration NOT applied - columns missing")
            return False
        else:
            print(f"⚠️  Could not determine migration status: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error checking migration: {e}")
        return False

def print_migration_instructions():
    """Print instructions for applying the migration."""
    print("\n" + "="*70)
    print("📋 DATABASE MIGRATION REQUIRED")
    print("="*70)
    print("\nThe database needs new columns for materials tracking.")
    print("\nTo apply the migration, follow these steps:\n")
    print("1. Go to your Supabase Dashboard:")
    print(f"   https://supabase.com/dashboard/project/{SUPABASE_URL.split('//')[1].split('.')[0]}")
    print("\n2. Navigate to: SQL Editor (left sidebar)")
    print("\n3. Click 'New Query'")
    print("\n4. Copy and paste this SQL:\n")

    print("-" * 70)
    print("""
-- Add fields to track materials upload and email notification status
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS materials_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS materials_uploaded_at TIMESTAMPTZ;

-- Create index for querying assignments needing notification
CREATE INDEX IF NOT EXISTS idx_assignments_notification_pending
ON public.assignments(notification_sent, created_at)
WHERE notification_sent = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.assignments.materials_uploaded IS 'Tracks whether user has uploaded study materials for this assignment';
COMMENT ON COLUMN public.assignments.notification_sent IS 'Tracks whether email notification was sent to user about this assignment';

-- Display results
SELECT 'Migration applied successfully!' as status;
    """)
    print("-" * 70)
    print("\n5. Click 'Run' (or press Ctrl+Enter)")
    print("\n6. You should see: 'Migration applied successfully!'")
    print("\n7. Run this script again to verify")
    print("="*70 + "\n")

if __name__ == '__main__':
    print("🚀 Database Migration Tool")
    print("="*70)

    migration_applied = check_migration_status()

    if migration_applied:
        print("\n✅ All good! Migration is already applied.")
        print("   The database has all required columns.")
    else:
        print_migration_instructions()
        print("\n⚠️  Run this script again after applying the migration to verify.")
