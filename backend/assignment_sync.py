# assignment_sync.py - Bridge MongoDB calendar events to Supabase assignments
import os
import sys
from datetime import datetime, timedelta
from supabase import create_client, Client
from database import (
    get_unprocessed_assignments,
    get_upcoming_assignments,
    mark_assignment_processed,
    mark_reminder_sent,
    extract_assignment_info
)

# Supabase configuration
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://dpyvbkrfasiskdrqimhf.supabase.co')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweXZia3JmYXNpc2tkcnFpbWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDEzNzUsImV4cCI6MjA3ODE3NzM3NX0.JGb_M_zbh2Lzrca8O_GY8UtCvMnZocsiUBEbpELsLV8')

def get_supabase_client():
    """Get Supabase client."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def create_assignment_in_supabase(user_id, assignment_data):
    """
    Create an assignment in Supabase from calendar event data.
    Args:
        user_id: UUID of the user
        assignment_data: dict with assignment details
    Returns:
        Created assignment object or None if failed
    """
    try:
        supabase = get_supabase_client()
        
        # Prepare assignment data
        assignment = {
            'user_id': user_id,
            'title': assignment_data['title'],
            'type': assignment_data['type'],
            'exam_subtype': assignment_data.get('exam_subtype', 'hybrid'),
            'due_at': assignment_data['due_date'],
            'topics': extract_topics_from_title(assignment_data['title']),
            'status': 'upcoming'
        }
        
        # Insert into Supabase
        result = supabase.table('assignments').insert(assignment).execute()
        
        if result.data:
            print(f"✅ Created assignment in Supabase: {assignment_data['title']}")
            return result.data[0]
        else:
            print(f"❌ Failed to create assignment: {result}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating assignment in Supabase: {e}")
        return None

def extract_topics_from_title(title):
    """
    Try to extract topics from assignment title.
    This is a simple heuristic - can be improved.
    """
    # Remove common words
    common_words = ['exam', 'test', 'quiz', 'final', 'midterm', 'assignment', 'the', 'a', 'an']
    words = title.split()
    topics = [word for word in words if word.lower() not in common_words and len(word) > 2]
    
    # Return first 3 words as topics, or generic topic
    if len(topics) > 0:
        return topics[:3]
    else:
        return [title.split()[0] if title.split() else 'General']

def sync_calendar_to_assignments(user_id):
    """
    Sync unprocessed calendar assignments to Supabase.
    This should be called periodically or when user logs in.
    Args:
        user_id: UUID of the user to create assignments for
    Returns:
        Number of assignments synced
    """
    unprocessed = get_unprocessed_assignments()
    synced_count = 0
    
    print(f"\n🔄 Syncing {len(unprocessed)} unprocessed assignments...")
    
    for calendar_event in unprocessed:
        assignment_info = extract_assignment_info(
            calendar_event['details'],
            calendar_event['datetime']
        )
        
        # Create in Supabase
        created = create_assignment_in_supabase(user_id, assignment_info)
        
        if created:
            # Mark as processed in MongoDB
            mark_assignment_processed(calendar_event['_id'])
            synced_count += 1
    
    print(f"✅ Synced {synced_count} assignments to Supabase")
    return synced_count

def send_proactive_reminders(user_id, days_ahead=7):
    """
    Send proactive reminders for upcoming assignments.
    This should be run daily via cron or scheduler.
    Args:
        user_id: UUID of the user
        days_ahead: How many days ahead to remind (default 7)
    Returns:
        List of reminders sent
    """
    upcoming = get_upcoming_assignments(days_ahead)
    reminders = []
    
    print(f"\n📧 Checking for assignments in next {days_ahead} days...")
    
    for assignment in upcoming:
        # Calculate days until assignment
        assignment_date = datetime.fromisoformat(assignment['datetime'].replace('Z', '+00:00'))
        days_until = (assignment_date - datetime.now(assignment_date.tzinfo)).days
        
        # Create reminder message
        reminder = {
            'assignment_id': str(assignment['_id']),
            'title': assignment['details'],
            'date': assignment['datetime'],
            'days_until': days_until,
            'message': generate_reminder_message(assignment, days_until)
        }
        
        reminders.append(reminder)
        
        # Mark reminder as sent
        mark_reminder_sent(assignment['_id'])
        
        print(f"📧 Reminder: {reminder['message']}")
    
    return reminders

def generate_reminder_message(assignment, days_until):
    """Generate a friendly reminder message."""
    title = assignment['details']
    
    if days_until <= 1:
        urgency = "tomorrow"
        emoji = "🚨"
    elif days_until <= 3:
        urgency = f"in {days_until} days"
        emoji = "⚠️"
    else:
        urgency = f"in {days_until} days"
        emoji = "📚"
    
    # Extract course name
    info = extract_assignment_info(title, assignment['datetime'])
    course = info['course_name']
    
    message = (
        f"{emoji} Hey! You have an exam {urgency} on {course}. "
        f"Can you share your slides/notes so I can generate personalized practice questions?"
    )
    
    return message

def check_and_sync_for_user(user_email):
    """
    Main function to check calendar and sync for a user.
    Args:
        user_email: Email of the user to sync for
    """
    try:
        supabase = get_supabase_client()
        
        # Get user by email
        result = supabase.table('profiles').select('*').eq('email', user_email).execute()
        
        if not result.data:
            print(f"❌ User not found: {user_email}")
            return
        
        user = result.data[0]
        user_id = user['id']
        
        print(f"\n👤 Syncing for user: {user_email}")
        print(f"   User ID: {user_id}")
        
        # Sync unprocessed assignments
        sync_calendar_to_assignments(user_id)
        
        # Check for reminders
        reminders = send_proactive_reminders(user_id, days_ahead=7)
        
        print(f"\n✅ Sync complete! {len(reminders)} reminders generated")
        
        return reminders
        
    except Exception as e:
        print(f"❌ Error during sync: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("🚀 Assignment Sync Service")
    print("=" * 60)
    
    # Example: sync for first user in database
    # In production, this would run for all users
    if len(sys.argv) > 1:
        user_email = sys.argv[1]
        check_and_sync_for_user(user_email)
    else:
        print("Usage: python assignment_sync.py <user_email>")
        print("\nOr run without args to sync for all users (not implemented yet)")

