# google_calendar.py - Create Google Calendar events for study sessions
from __future__ import print_function
import datetime
import os.path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Permission to read AND write calendar events
# Note: This requires the full calendar scope for creating events
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service_with_write_access():
    """
    Authenticate with Google Calendar with write permissions.
    Returns the service object for creating events.
    """
    creds = None

    # Check multiple possible locations for token.json
    # Note: Since we need write access, we may need a separate token
    token_paths = ['backend/token_write.json', 'token_write.json', './token_write.json',
                   'backend/token.json', 'token.json', './token.json']
    credentials_paths = ['backend/credentials.json', 'credentials.json', './credentials.json']

    token_path = None
    credentials_path = None

    for path in token_paths:
        if os.path.exists(path):
            token_path = path
            print(f"✅ Found token at: {path}")
            break

    for path in credentials_paths:
        if os.path.exists(path):
            credentials_path = path
            print(f"✅ Found credentials at: {path}")
            break

    # Try to load existing token
    if token_path and os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            print("📝 Loaded existing token with write access")
        except Exception as e:
            print(f"⚠️ Could not load token: {e}")
            creds = None

    # Check if we need to refresh or re-authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Token expired, attempting to refresh...")
            try:
                creds.refresh(Request())
                print("✅ Token refreshed successfully!")
                # Save refreshed token
                save_path = token_path or 'backend/token_write.json'
                with open(save_path, 'w') as token:
                    token.write(creds.to_json())
                print(f"💾 Saved refreshed token to: {save_path}")
            except Exception as e:
                print(f"❌ Token refresh failed: {e}")
                print("🔐 Will re-authenticate with credentials.json...")
                creds = None

        # If still no valid credentials, re-authenticate
        if not creds or not creds.valid:
            if not credentials_path:
                raise Exception(
                    "❌ credentials.json not found! "
                    "Need it to generate a new token with write permissions. "
                    "Place credentials.json in the backend/ folder."
                )

            print("🔐 Authenticating with Google (requesting WRITE access)...")
            print("⚠️ A browser window will open. Please authorize the app.")

            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

            # Save the new token
            save_path = token_path or 'backend/token_write.json'
            with open(save_path, 'w') as token:
                token.write(creds.to_json())
            print(f"✅ New token with write access saved to: {save_path}")

    if not creds or not creds.valid:
        raise Exception("❌ Could not get valid credentials")

    service = build('calendar', 'v3', credentials=creds)
    return service

def get_existing_events_for_day(service, date):
    """
    Get all events for a specific day.

    Args:
        service: Google Calendar service object
        date: datetime object for the day to check

    Returns:
        list: List of events with start and end times
    """
    try:
        # Set time range for the entire day
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)

        events_result = service.events().list(
            calendarId='primary',
            timeMin=day_start.isoformat(),
            timeMax=day_end.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])

        # Parse events into simple format
        parsed_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))

            # Skip all-day events
            if 'T' not in start:
                continue

            start_dt = datetime.datetime.fromisoformat(start.replace('Z', '+00:00'))
            end_dt = datetime.datetime.fromisoformat(end.replace('Z', '+00:00'))

            parsed_events.append({
                'start': start_dt,
                'end': end_dt,
                'summary': event.get('summary', 'Busy')
            })

        return parsed_events

    except Exception as e:
        print(f"⚠️ Error fetching calendar events: {e}")
        return []

def find_best_available_time(service, preferred_date, preferred_hour, duration_min=60, min_hour=7, max_hour=23):
    """
    Find the best available time slot that's closest to the preferred hour.

    Args:
        service: Google Calendar service object
        preferred_date: datetime object for the preferred date
        preferred_hour: int (0-23) for preferred hour
        duration_min: int - duration of the session in minutes
        min_hour: int - earliest hour to schedule (default 7 AM)
        max_hour: int - latest hour to schedule (default 11 PM)

    Returns:
        datetime: Best available start time, or None if no slot found
    """
    try:
        # Get existing events for this day
        existing_events = get_existing_events_for_day(service, preferred_date)

        # Ensure preferred_hour is within valid range
        if preferred_hour < min_hour:
            preferred_hour = min_hour
        elif preferred_hour > max_hour - (duration_min / 60):
            preferred_hour = int(max_hour - (duration_min / 60))

        # Try the preferred hour first
        candidate_times = [preferred_hour]

        # Then try times nearby (±1, ±2, ±3 hours, etc.)
        for offset in range(1, max_hour - min_hour):
            if preferred_hour + offset <= max_hour - (duration_min / 60):
                candidate_times.append(preferred_hour + offset)
            if preferred_hour - offset >= min_hour:
                candidate_times.append(preferred_hour - offset)

        # Check each candidate time for conflicts
        for hour in candidate_times:
            candidate_start = preferred_date.replace(hour=hour, minute=0, second=0, microsecond=0)
            candidate_end = candidate_start + datetime.timedelta(minutes=duration_min)

            # Check if this slot conflicts with any existing event
            has_conflict = False
            for event in existing_events:
                # Check if times overlap
                if (candidate_start < event['end'] and candidate_end > event['start']):
                    has_conflict = True
                    print(f"   ⚠️ Conflict at {hour}:00 with: {event['summary']}")
                    break

            if not has_conflict:
                if hour != preferred_hour:
                    print(f"   ✅ Found available slot at {hour}:00 (preferred was {preferred_hour}:00)")
                return candidate_start

        # If no slot found, return preferred time anyway (user can manually adjust)
        print(f"   ⚠️ No conflict-free slot found, using preferred time {preferred_hour}:00")
        return preferred_date.replace(hour=preferred_hour, minute=0, second=0, microsecond=0)

    except Exception as e:
        print(f"⚠️ Error finding available time: {e}")
        # Fallback to preferred time
        return preferred_date.replace(hour=preferred_hour, minute=0, second=0, microsecond=0)

def create_calendar_event_for_session(session, assignment_title, frontend_url="http://localhost:8080"):
    """
    Create a Google Calendar event for a study session.

    Args:
        session: dict with session data (id, scheduled_at, duration_min, topics, focus)
        assignment_title: str - title of the assignment
        frontend_url: str - base URL for the frontend (default: http://localhost:8080)

    Returns:
        event: The created calendar event or None if failed
    """
    try:
        service = get_calendar_service_with_write_access()

        # Parse session time
        session_time = session.get('scheduled_at')
        if isinstance(session_time, str):
            # Remove 'Z' and parse as ISO format
            start_time = datetime.datetime.fromisoformat(session_time.replace('Z', '+00:00'))
        else:
            # If it's already a datetime object
            start_time = session_time

        # Calculate end time
        duration_min = session.get('duration_min', 60)
        end_time = start_time + datetime.timedelta(minutes=duration_min)

        # Format topics
        topics = session.get('topics', [])
        if topics:
            topics_str = ", ".join(topics[:3]) if isinstance(topics, list) else str(topics)
        else:
            topics_str = "General review"

        # Get focus
        focus = session.get('focus', 'study').title()

        # Build session URL
        session_id = session.get('id', '')
        session_url = f"{frontend_url}/sessions/{session_id}" if session_id else f"{frontend_url}/assignments"

        # Create event description
        description = f"""📚 Study Session for {assignment_title}

Focus: {focus}
Topics: {topics_str}

🔗 Start your session: {session_url}

This study session was automatically scheduled by your AI Study Companion.
"""

        # Create the calendar event
        event = {
            'summary': f'📚 Study: {assignment_title}',
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'Europe/Amsterdam',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'Europe/Amsterdam',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 30},      # 30 min before
                    {'method': 'email', 'minutes': 1440},    # 1 day before (24 hours)
                ],
            },
            'colorId': '7',  # Peacock blue for study sessions
        }

        # Insert the event into the calendar
        created_event = service.events().insert(calendarId='primary', body=event).execute()

        print(f"✅ Created calendar event: {assignment_title}")
        print(f"   📅 Time: {start_time.strftime('%Y-%m-%d %H:%M')}")
        print(f"   🔗 Link: {created_event.get('htmlLink', 'N/A')}")

        return created_event

    except Exception as e:
        print(f"❌ Failed to create calendar event: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_calendar_events_for_sessions(sessions, assignment_title, frontend_url="http://localhost:8080"):
    """
    Create Google Calendar events for multiple study sessions.

    Args:
        sessions: list of session dicts
        assignment_title: str - title of the assignment
        frontend_url: str - base URL for the frontend

    Returns:
        int: Number of events successfully created
    """
    if not sessions:
        print("⚠️ No sessions provided to create calendar events")
        return 0

    print(f"\n📅 Creating {len(sessions)} calendar event(s) for: {assignment_title}")

    created_count = 0
    for session in sessions:
        event = create_calendar_event_for_session(session, assignment_title, frontend_url)
        if event:
            created_count += 1

    print(f"✅ Created {created_count}/{len(sessions)} calendar events")
    return created_count

if __name__ == '__main__':
    print("🚀 Google Calendar Event Creator")
    print("=" * 60)

    # Test authentication
    try:
        service = get_calendar_service_with_write_access()
        print("\n✅ Successfully authenticated with Google Calendar!")
        print("   You can now create calendar events for study sessions.")
    except Exception as e:
        print(f"\n❌ Authentication failed: {e}")
