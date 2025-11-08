# Study Companion - Calendar Integration Backend

This Python backend integrates Google Calendar with your React app, automatically detecting assignments and sending proactive reminders.

## 🎯 What It Does

1. **Fetches events** from your Google Calendar
2. **Detects assignments** using keywords (exam, test, quiz, assignment, etc.)
3. **Stores in MongoDB** (your teammates' database)
4. **Syncs to Supabase** (creates assignments automatically)
5. **Sends proactive reminders** a week before exams

---

## 📦 Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Google Calendar API

The `token.json` file is already included (from your teammates).

If you need to regenerate credentials:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Download as `credentials.json`
4. Place in `backend/` folder

### 3. Test MongoDB Connection

```bash
python database.py
```

You should see:
```
✅ Connected to MongoDB successfully!
📊 Total events: X
📚 Assignments detected: X
```

### 4. Fetch Calendar Events

```bash
python calendar_reader.py
```

This will:
- Authenticate with Google (first time only)
- Fetch events from your calendar
- Store them in MongoDB
- Detect assignments automatically

### 5. Start the API Server

```bash
python api.py
```

The API will run on: http://localhost:5001

---

## 🔌 API Endpoints

### 1. Health Check
```bash
GET http://localhost:5001/health
```

### 2. Sync Calendar
```bash
POST http://localhost:5001/api/calendar/sync
Body: { "days_ahead": 90 }
```
Fetches events from Google Calendar and stores in MongoDB.

### 3. Get All Events
```bash
GET http://localhost:5001/api/calendar/events
```
Returns all calendar events from MongoDB.

### 4. Get Unprocessed Assignments
```bash
GET http://localhost:5001/api/assignments/unprocessed
```
Returns assignments that haven't been synced to Supabase yet.

### 5. Sync to Supabase
```bash
POST http://localhost:5001/api/assignments/sync-to-supabase
Body: { "user_email": "your@email.com" }
```
Creates assignments in Supabase from calendar events.

### 6. Check Reminders
```bash
POST http://localhost:5001/api/reminders/check
Body: { 
  "user_email": "your@email.com",
  "days_ahead": 7
}
```
Generates reminders for upcoming assignments.

---

## 🔄 How It Works

### Assignment Detection

Keywords that trigger assignment detection:
- `exam`, `test`, `quiz`, `midterm`, `final`
- `assignment`, `homework`, `project`
- `presentation`, `essay`, `paper`
- `due`, `deadline`, `submit`

### Data Flow

```
Google Calendar
    ↓ (calendar_reader.py)
MongoDB (calendar_events collection)
    ↓ (assignment_sync.py)
Supabase (assignments table)
    ↓
React Frontend (your app)
```

### MongoDB Schema

**calendar_events collection:**
```json
{
  "_id": ObjectId,
  "details": "Machine Learning Exam",
  "datetime": "2025-11-15T09:00:00Z",
  "google_event_id": "...",
  "description": "",
  "location": "",
  "is_assignment": true,
  "processed": false,
  "reminder_sent": false,
  "created_at": "2025-11-08T..."
}
```

---

## 🤖 Automation (Proactive Reminders)

### Manual Trigger

```bash
# Check for user's reminders
python -c "from assignment_sync import check_and_sync_for_user; check_and_sync_for_user('your@email.com')"
```

### Scheduled (Cron Job)

Add to crontab to run daily:

```bash
# Run every day at 9 AM
0 9 * * * cd /path/to/backend && python -c "from assignment_sync import check_and_sync_for_user; check_and_sync_for_user('your@email.com')"
```

### Reminder Message Example

```
🚨 Hey! You have an exam in 3 days on Machine Learning. 
Can you share your slides/notes so I can generate 
personalized practice questions?
```

---

## 🔗 Frontend Integration

### Add Calendar Sync Button to React App

```typescript
// src/pages/Dashboard.tsx
const syncCalendar = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days_ahead: 90 })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success(`Synced ${data.stats.total_events} events!`);
      
      // Auto-sync to Supabase
      await syncToSupabase();
    }
  } catch (error) {
    toast.error('Failed to sync calendar');
  }
};

const syncToSupabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  await fetch('http://localhost:5001/api/assignments/sync-to-supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: user.email })
  });
};
```

---

## 🧪 Testing

### 1. Test Calendar Fetch
```bash
python calendar_reader.py
```

### 2. Test MongoDB Connection
```bash
python database.py
```

### 3. Test Assignment Sync
```bash
python assignment_sync.py your@email.com
```

### 4. Test API
```bash
# Terminal 1: Start API
python api.py

# Terminal 2: Test endpoints
curl http://localhost:5001/health
curl -X POST http://localhost:5001/api/calendar/sync
curl http://localhost:5001/api/assignments/unprocessed
```

---

## 📊 Monitoring

### Check Database Stats
```bash
python -c "from database import get_database; db = get_database(); print(f'Events: {db.calendar_events.count_documents({})}'); print(f'Assignments: {db.calendar_events.count_documents({\"is_assignment\": True})}')"
```

### View All Events
```bash
python -c "from database import get_all_events; import json; print(json.dumps([{k: str(v) for k, v in e.items()} for e in get_all_events()], indent=2))"
```

---

## 🐛 Troubleshooting

### "No module named 'pymongo'"
```bash
pip install -r requirements.txt
```

### "Failed to connect to MongoDB"
- Check internet connection
- Verify MongoDB connection string in `database.py`

### "Token has expired"
Delete `token.json` and run `calendar_reader.py` again to re-authenticate.

### "User not found in Supabase"
Make sure the user has signed up in the React app first.

---

## 🚀 Production Deployment

### Option 1: Cloud Functions
Deploy to AWS Lambda or Google Cloud Functions

### Option 2: Background Worker
Run as a background service with supervisord or systemd

### Option 3: Scheduled Task
Use GitHub Actions, Heroku Scheduler, or Vercel Cron

---

## 📝 Notes

- **Hybrid Approach**: Uses MongoDB for calendar events, Supabase for assignments
- **Why Both?**: Your teammates built MongoDB code, your app uses Supabase
- **Bridge Service**: `assignment_sync.py` connects the two databases
- **No Data Loss**: Calendar events stay in MongoDB, assignments in Supabase

---

## ✅ Next Steps

1. Run `python calendar_reader.py` to fetch your calendar
2. Run `python api.py` to start the backend
3. Integrate with React frontend (see Frontend Integration section)
4. Set up cron job for daily reminders
5. Demo the proactive reminder feature!

**Your system is now fully integrated!** 🎉

