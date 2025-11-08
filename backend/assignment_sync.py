# assignment_sync.py - Bridge MongoDB calendar events to Supabase assignments
import os
import sys
import requests
from datetime import datetime, timedelta
from database import (
    get_unprocessed_assignments,
    get_upcoming_assignments,
    mark_assignment_processed,
    mark_reminder_sent,
    extract_assignment_info
)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', os.getenv('VITE_SUPABASE_URL', 'https://lcpexhkqaqftaqdtgebp.supabase.co'))
SUPABASE_KEY = os.getenv('SUPABASE_KEY', os.getenv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY'))

def get_supabase_client():
    """Get Supabase client - using REST API directly to avoid version issues."""
    # Return a simple dict-based client that uses requests
    return {
        'url': SUPABASE_URL,
        'key': SUPABASE_KEY,
        'headers': {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    }

def create_assignment_in_supabase(user_id, assignment_data, create_sessions=False):
    """
    Create an assignment in Supabase from calendar event data.
    Args:
        user_id: UUID of the user
        assignment_data: dict with assignment details
        create_sessions: Whether to create study sessions immediately (default: False)
    Returns:
        Created assignment object or None if failed
    """
    try:
        client = get_supabase_client()

        # Prepare assignment data
        assignment = {
            'user_id': user_id,
            'title': assignment_data['title'],
            'type': assignment_data['type'],
            'exam_subtype': assignment_data.get('exam_subtype', 'hybrid'),
            'due_at': assignment_data['due_date'],
            'topics': extract_topics_from_title(assignment_data['title']),
            'status': 'upcoming',
            'materials_uploaded': False,
            'notification_sent': False
        }

        # Insert into Supabase using REST API
        url = f"{client['url']}/rest/v1/assignments"
        response = requests.post(url, json=assignment, headers=client['headers'])

        if response.status_code in [200, 201]:
            result = response.json()
            if result and len(result) > 0:
                created_assignment = result[0]
                print(f"✅ Created assignment in Supabase: {assignment_data['title']}")

                # Only create study sessions if explicitly requested (e.g., after materials uploaded)
                if create_sessions:
                    assignment_id = created_assignment.get('id')
                    if assignment_id:
                        create_study_sessions_for_assignment(client, user_id, assignment_id, assignment_data)

                return created_assignment
            else:
                print(f"⚠️ Assignment created but no data returned")
                return {'id': 'unknown', **assignment}
        else:
            print(f"❌ Failed to create assignment: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error creating assignment in Supabase: {e}")
        import traceback
        traceback.print_exc()
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

def create_study_sessions_for_assignment(client, user_id, assignment_id, assignment_data):
    """Create study sessions for an assignment."""
    try:
        due_date = datetime.fromisoformat(assignment_data['due_date'].replace('Z', '+00:00'))
        today = datetime.now(due_date.tzinfo) if due_date.tzinfo else datetime.now()
        days_until_due = max(1, (due_date - today).days)
        
        # Determine number of sessions based on assignment type
        assignment_type = assignment_data.get('type', 'exam')
        if assignment_type == 'exam':
            sessions_needed = min(days_until_due - 1, 5)
        elif assignment_type == 'quiz':
            sessions_needed = min(days_until_due - 1, 2)
        else:
            sessions_needed = min(days_until_due - 1, 3)
        
        if sessions_needed <= 0:
            return 0
        
        sessions = []
        session_duration = 60  # Default 60 minutes
        
        # Create study sessions
        for i in range(sessions_needed):
            day_offset = int((days_until_due - 1) * (i / sessions_needed))
            session_date = today + timedelta(days=day_offset)
            session_date = session_date.replace(hour=18, minute=0, second=0, microsecond=0)  # 6 PM default
            
            progress = i / sessions_needed
            focus = 'concepts' if progress < 0.5 else 'practice'
            
            session = {
                'user_id': user_id,
                'assignment_id': assignment_id,
                'scheduled_at': session_date.isoformat(),
                'duration_min': session_duration,
                'topics': assignment_data.get('topics', []),
                'focus': focus,
                'status': 'scheduled'
            }
            sessions.append(session)
        
        # Insert sessions using REST API
        url = f"{client['url']}/rest/v1/study_sessions"
        response = requests.post(url, json=sessions, headers=client['headers'])
        
        if response.status_code in [200, 201]:
            created_sessions = response.json()
            print(f"✅ Created {len(created_sessions)} study sessions for assignment")
            return len(created_sessions)
        else:
            print(f"⚠️ Failed to create study sessions: {response.status_code} - {response.text}")
            return 0
            
    except Exception as e:
        print(f"⚠️ Error creating study sessions: {e}")
        return 0

def sync_calendar_to_assignments(user_id, send_notification_callback=None):
    """
    Sync unprocessed calendar assignments to Supabase.
    This creates the assignment but does NOT create study sessions.
    Study sessions are created later after user uploads materials.

    Args:
        user_id: UUID of the user to create assignments for
        send_notification_callback: Optional callback function to send email notification
                                   Should accept (user_email, assignment_info) as arguments
    Returns:
        List of created assignments
    """
    unprocessed = get_unprocessed_assignments()
    created_assignments = []

    print(f"\n🔄 Syncing {len(unprocessed)} unprocessed assignments...")

    for calendar_event in unprocessed:
        assignment_info = extract_assignment_info(
            calendar_event['details'],
            calendar_event['datetime']
        )

        # Create assignment in Supabase WITHOUT study sessions
        created = create_assignment_in_supabase(user_id, assignment_info, create_sessions=False)

        if created:
            created_assignments.append(created)

            # Mark as processed in MongoDB
            mark_assignment_processed(calendar_event['_id'])

            # Return the created assignment info for notification
            print(f"✅ Assignment created: {assignment_info['title']}")
            print(f"   ⚠️ Study sessions NOT created yet - waiting for user to upload materials")

    print(f"\n✅ Synced {len(created_assignments)} assignments to Supabase")
    print(f"   📧 Email notifications will be sent to prompt material upload")
    return created_assignments

def mark_assignment_notification_sent(assignment_id):
    """
    Mark that email notification was sent for this assignment.
    Args:
        assignment_id: UUID of the assignment
    """
    try:
        client = get_supabase_client()
        url = f"{client['url']}/rest/v1/assignments"
        url += f"?id=eq.{assignment_id}"

        update_data = {
            'notification_sent': True,
            'notification_sent_at': datetime.now().isoformat()
        }

        response = requests.patch(url, json=update_data, headers=client['headers'])

        if response.status_code in [200, 204]:
            print(f"✅ Marked notification sent for assignment {assignment_id}")
            return True
        else:
            print(f"⚠️ Failed to mark notification: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error marking notification sent: {e}")
        return False


def create_sessions_for_assignment(assignment_id, user_id):
    """
    Create study sessions for an existing assignment (e.g., after materials uploaded).
    Args:
        assignment_id: UUID of the assignment
        user_id: UUID of the user
    Returns:
        Number of sessions created
    """
    try:
        client = get_supabase_client()

        # Get assignment details
        url = f"{client['url']}/rest/v1/assignments"
        url += f"?id=eq.{assignment_id}&select=*"
        response = requests.get(url, headers=client['headers'])

        if response.status_code != 200:
            print(f"❌ Failed to get assignment: {response.status_code}")
            return 0

        assignments = response.json()
        if not assignments or len(assignments) == 0:
            print(f"❌ Assignment not found: {assignment_id}")
            return 0

        assignment = assignments[0]

        # Prepare assignment data for session creation
        assignment_data = {
            'due_date': assignment['due_at'],
            'type': assignment['type'],
            'topics': assignment.get('topics', [])
        }

        # Create study sessions
        sessions_created = create_study_sessions_for_assignment(
            client, user_id, assignment_id, assignment_data
        )

        # Mark materials as uploaded
        update_url = f"{client['url']}/rest/v1/assignments"
        update_url += f"?id=eq.{assignment_id}"
        update_data = {
            'materials_uploaded': True,
            'materials_uploaded_at': datetime.now().isoformat()
        }
        requests.patch(update_url, json=update_data, headers=client['headers'])

        print(f"✅ Created {sessions_created} study sessions for assignment")
        return sessions_created

    except Exception as e:
        print(f"❌ Error creating sessions for assignment: {e}")
        import traceback
        traceback.print_exc()
        return 0


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
    Also sends email notifications for newly created assignments.
    Args:
        user_email: Email of the user to sync for
    """
    try:
        client = get_supabase_client()

        # Get user by email using REST API
        url = f"{client['url']}/rest/v1/profiles"
        url += f"?email=eq.{user_email}&select=id,email"
        response = requests.get(url, headers=client['headers'])

        if response.status_code != 200:
            print(f"❌ Error fetching user: {response.status_code} - {response.text}")
            print(f"   💡 Make sure you're logged into the app first!")
            return

        result = response.json()
        if not result or len(result) == 0:
            print(f"❌ User not found: {user_email}")
            print(f"   📝 This email doesn't have a profile in Supabase yet.")
            print(f"   👉 To fix this:")
            print(f"      1. Go to: http://localhost:8080/auth")
            print(f"      2. Sign up or log in with: {user_email}")
            print(f"      3. Your profile will be created automatically")
            print(f"      4. Assignments will sync on next agent check!")
            return

        user = result[0]
        user_id = user['id']

        print(f"\n👤 Syncing for user: {user_email}")
        print(f"   User ID: {user_id}")

        # Sync unprocessed assignments and get created assignments
        created_assignments = sync_calendar_to_assignments(user_id)

        # Send email notification for each newly created assignment
        if created_assignments:
            print(f"\n📧 Sending email notifications for {len(created_assignments)} new assignments...")
            from email_service import send_new_assignment_notification

            for assignment in created_assignments:
                try:
                    assignment_details = {
                        'id': assignment['id'],
                        'title': assignment['title'],
                        'date': assignment['due_at'],
                        'type': assignment['type'],
                        'course': assignment['title']
                    }

                    # Send email
                    email_sent = send_new_assignment_notification(user_email, assignment_details)

                    if email_sent:
                        mark_assignment_notification_sent(assignment['id'])
                        print(f"✅ Email sent for: {assignment['title']}")
                    else:
                        print(f"⚠️  Failed to send email for: {assignment['title']}")
                except Exception as e:
                    print(f"❌ Error sending email for {assignment.get('title', 'Unknown')}: {e}")
                    continue

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

