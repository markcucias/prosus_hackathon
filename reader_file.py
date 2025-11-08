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
        summary = event.get('summary', 'No Title')
        start = event['start'].get('dateTime', event['start'].get('date'))
        print(f"- {summary} ({start})")
        # Store in MongoDB
        insert_event({
            "details": summary,
            "datetime": start
        })


if __name__ == '__main__':
    list_and_store_events()
