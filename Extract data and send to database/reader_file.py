# calendar_reader.py
from __future__ import print_function
import datetime
import os.path
import re
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from database2 import insert_event  # import MongoDB helper

# Permission to read calendar data
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

def get_calendar_service():
    """Authenticate with Google Calendar and return the service object."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    service = build('calendar', 'v3', credentials=creds)
    return service


def parse_event_summary(event_summary):
    """
    Split the event text into 'details' and 'datetime' parts.
    Example:
    '4032HCIIVY - Human Computer Interaction & Information Visualization - Werkgroep 101 (2025-12-08T11:00:00+01:00)'
    → details: '4032HCIIVY - Human Computer Interaction & Information Visualization - Werkgroep 101'
      datetime: '2025-12-08T11:00:00+01:00'
    """
    match = re.match(r"^(.*)\(([^)]+)\)$", event_summary.strip())
    if match:
        details = match.group(1).strip()
        datetime_str = match.group(2).strip()
    else:
        details = event_summary.strip()
        datetime_str = None

    return {
        "details": details,
        "datetime": datetime_str
    }


def list_and_store_events():
    """Fetch upcoming events from primary calendar and store them in MongoDB."""
    service = get_calendar_service()
    calendar_id = 'primary'

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    events_result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=now,
            maxResults=50,
            singleEvents=True,
            orderBy='startTime'
        )
        .execute()
    )

    events = events_result.get('items', [])
    if not events:
        print("No upcoming events found.")
        return

    print("\n🎓 Upcoming Events:")
    for event in events:
        summary = event.get('summary', '')
        if not summary:
            continue

        parsed = parse_event_summary(summary)
        data = {
            "details": parsed["details"],
            "datetime": parsed["datetime"]
        }

        print(f"- {data['details']} ({data['datetime']})")
        insert_event(data)


if __name__ == '__main__':
    list_and_store_events()
