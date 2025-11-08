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

    return build('calendar', 'v3', credentials=creds)


def is_time_busy(service, start_time, end_time, calendar_id='primary'):
    """Check if time slot overlaps with existing events."""
    body = {
        "timeMin": start_time.isoformat() + "Z",
        "timeMax": end_time.isoformat() + "Z",
        "items": [{"id": calendar_id}]
    }
    freebusy = service.freebusy().query(body=body).execute()
    busy_times = freebusy['calendars'][calendar_id]['busy']
    return len(busy_times) > 0


def find_next_available_slot(service, start_time, duration_hours=1, timezone='UTC', calendar_id='primary',
                             workday_start=8, workday_end=18, step_minutes=30):
    """
    Finds the next available free time slot, possibly moving to the next day.
    """
    duration = datetime.timedelta(hours=duration_hours)

    while True:
        end_time = start_time + duration

        # If we've gone past the working hours, jump to next day's morning
        if end_time.hour >= workday_end:
            start_time = datetime.datetime.combine(
                start_time.date() + datetime.timedelta(days=1),
                datetime.time(hour=workday_start)
            )
            end_time = start_time + duration

        # Check if current slot is free
        if not is_time_busy(service, start_time, end_time, calendar_id):
            return start_time, end_time

        # Otherwise, move forward
        start_time += datetime.timedelta(minutes=step_minutes)


def add_event(summary, description, start_time, duration_hours=1, timezone='UTC', location=None):
    service = get_calendar_service()
    calendar_id = 'primary'

    # Find the next available time slot (auto shifts days if needed)
    free_start, free_end = find_next_available_slot(
        service, start_time, duration_hours, timezone
    )

    event = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': free_start.isoformat(), 'timeZone': timezone},
        'end': {'dateTime': free_end.isoformat(), 'timeZone': timezone},
    }

    if location:
        event['location'] = location

    created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
    print(f"✅ Event scheduled at {free_start.strftime('%Y-%m-%d %H:%M')} ({timezone})")
    print(f"🔗 {created_event.get('htmlLink')}")


if __name__ == '__main__':
    start = datetime.datetime(2025, 11, 10, 14, 0, 0)  # preferred start
    add_event(
        summary="AI Ethics Lecture",
        description="A talk on the ethical implications of AI technology.",
        start_time=start,
        duration_hours=2,
        timezone='America/New_York',
        location="Engineering Building Room 201"
    )
