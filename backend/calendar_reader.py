# calendar_reader.py - Fetch events from Google Calendar
from __future__ import print_function
import datetime
import os.path
import sys
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from database import insert_event, get_unprocessed_assignments

# Permission to read calendar data
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

def get_calendar_service():
    """Authenticate with Google Calendar and return the service object."""
    creds = None
    
    # Check multiple possible locations for token.json
    token_paths = ['backend/token.json', 'token.json', './token.json']
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
            print("📝 Loaded existing token")
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
                save_path = token_path or 'backend/token.json'
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
                    "Need it to generate a new token. "
                    "Place credentials.json in the backend/ folder."
                )
            
            print("🔐 Authenticating with Google...")
            print("⚠️ A browser window will open. Please authorize the app.")
            
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
            
            # Save the new token
            save_path = token_path or 'backend/token.json'
            with open(save_path, 'w') as token:
                token.write(creds.to_json())
            print(f"✅ New token saved to: {save_path}")
    
    if not creds or not creds.valid:
        raise Exception("❌ Could not get valid credentials")
    
    service = build('calendar', 'v3', credentials=creds)
    return service

def list_and_store_events(days_ahead=90):
    """
    Fetch upcoming events from primary calendar and store them in MongoDB.
    Args:
        days_ahead: How many days ahead to fetch events (default 90)
    """
    try:
        service = get_calendar_service()
        calendar_id = 'primary'

        now = datetime.datetime.utcnow()
        future = now + datetime.timedelta(days=days_ahead)
        
        now_str = now.isoformat() + 'Z'
        future_str = future.isoformat() + 'Z'

        print(f"\n🔍 Fetching events from {now.date()} to {future.date()}...")
        
        events_result = (
            service.events()
            .list(
                calendarId=calendar_id,
                timeMin=now_str,
                timeMax=future_str,
                maxResults=100,
                singleEvents=True,
                orderBy='startTime'
            )
            .execute()
        )

        events = events_result.get('items', [])
        
        if not events:
            print("📭 No upcoming events found.")
            return

        print(f"\n🎓 Found {len(events)} upcoming events:")
        print("-" * 60)
        
        assignments_found = 0
        
        for event in events:
            summary = event.get('summary', 'No Title')
            start = event['start'].get('dateTime', event['start'].get('date'))
            
            # Insert to MongoDB (with error handling)
            try:
                event_id = insert_event({
                    "details": summary,
                    "datetime": start,
                    "google_event_id": event.get('id'),
                    "description": event.get('description', ''),
                    "location": event.get('location', '')
                })
                
                # Check if it's an assignment
                from database import detect_if_assignment
                if detect_if_assignment(summary):
                    assignments_found += 1
                    print(f"📚 ASSIGNMENT: {summary} ({start})")
                else:
                    print(f"📅 Event: {summary} ({start})")
            
            except Exception as db_error:
                print(f"⚠️ DB error for '{summary}' (continuing): {str(db_error)[:80]}")
                continue
        
        print("-" * 60)
        print(f"✅ Stored {len(events)} events in MongoDB")
        print(f"📚 Detected {assignments_found} assignments")
        
        # Show unprocessed assignments
        unprocessed = get_unprocessed_assignments()
        if unprocessed:
            print(f"\n⚠️  {len(unprocessed)} assignments need to be processed:")
            for assignment in unprocessed:
                print(f"   - {assignment['details']} ({assignment['datetime']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fetching calendar events: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🚀 Study Companion - Calendar Reader")
    print("=" * 60)
    list_and_store_events()

