from __future__ import print_function
import datetime
import os.path
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if set(creds.scopes) != set(SCOPES):  # re-auth if scopes changed
            creds = None
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


def is_time_busy(service, start_time, end_time, calendar_id='primary'):
    """
    Checks if the time range is busy.
    Returns True if busy, False if free.
    """
    body = {
        "timeMin": start_time.isoformat() + "Z",
        "timeMax": end_time.isoformat() + "Z",
        "items": [{"id": calendar_id}]
    }

    freebusy = service.freebusy().query(body=body).execute()
    busy_times = freebusy['calendars'][calendar_id]['busy']
    return len(busy_times) > 0


def add_event(summary, description, start_time, end_time, timezone='UTC', location=None):
    service = get_calendar_service()
    calendar_id = 'primary'

    # Check if desired slot is busy
    while is_time_busy(service, start_time, end_time, calendar_id):
        print(f"⚠️  {start_time.strftime('%H:%M')}–{end_time.strftime('%H:%M')} is busy. Trying next slot...")
        start_time += datetime.timedelta(minutes=30)
        end_time += datetime.timedelta(minutes=30)

    event = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': start_time.isoformat(), 'timeZone': timezone},
        'end': {'dateTime': end_time.isoformat(), 'timeZone': timezone},
    }
    if location:
        event['location'] = location

    created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
    print(f"✅ Event created at {start_time.strftime('%Y-%m-%d %H:%M')}")
    print(f"🔗 {created_event.get('htmlLink')}")


if __name__ == '__main__':
    start = datetime.datetime(2025, 11, 10, 14, 0, 0)
    end = start + datetime.timedelta(hours=2)

    add_event(
        summary="Guest Lecture: AI Ethics",
        description="Special lecture about ethical issues in artificial intelligence.",
        start_time=start,
        end_time=end,
        timezone='America/New_York',
        location="Main Hall 203"
    )
