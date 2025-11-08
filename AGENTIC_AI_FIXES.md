# Agentic AI Assignment Flow - Fixes and Improvements

## Summary of Changes

This document describes the fixes implemented to correct the agentic AI assignment detection and notification flow.

## Problem Statement

The agentic AI was:
1. ❌ Not correctly adding assignments to "Your Assignments" page
2. ❌ Not sending email notifications when new assignments were detected
3. ❌ Creating study sessions automatically without user materials
4. ❌ Missing the required flow: detect → notify → wait for materials → create sessions

## Solution Overview

The flow has been redesigned to work as follows:

```
Calendar Sync (every 5 min)
    ↓
Detect New Assignment
    ↓
Create Assignment in Supabase
    ↓
Send Email Notification to User
    ↓
User Logs In & Uploads Materials
    ↓
Trigger Study Session Creation API
    ↓
Study Sessions Created
```

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20251108140000_add_materials_tracking.sql`

Added new fields to track assignment state:
- `materials_uploaded` (BOOLEAN) - Tracks if user uploaded study materials
- `notification_sent` (BOOLEAN) - Tracks if email notification was sent
- `notification_sent_at` (TIMESTAMPTZ) - When notification was sent
- `materials_uploaded_at` (TIMESTAMPTZ) - When materials were uploaded

### 2. New Email Notification Function
**File:** `backend/email_service.py`

Added `send_new_assignment_notification()`:
- Sends when a NEW assignment is first detected from calendar
- Prompts user to login and upload materials
- Beautiful HTML email template with clear instructions
- Different from `send_exam_reminder()` which is for upcoming deadlines

### 3. Modified Assignment Creation Logic
**File:** `backend/assignment_sync.py`

Changes to `create_assignment_in_supabase()`:
- Added `create_sessions` parameter (default: False)
- Only creates study sessions if explicitly requested
- Sets `materials_uploaded=False` and `notification_sent=False` initially

Changes to `sync_calendar_to_assignments()`:
- Now returns list of created assignments instead of count
- Does NOT create study sessions automatically
- Prepares data for email notification callback

New Functions Added:
- `mark_assignment_notification_sent()` - Marks notification as sent in Supabase
- `create_sessions_for_assignment()` - Creates study sessions for existing assignment

### 4. Updated Agentic Service
**File:** `backend/agentic_service.py`

Modified `check_and_notify_task()`:
- After creating assignments, sends email notification for each
- Marks notification as sent after successful email
- Clear logging of notification status

### 5. New API Endpoint
**File:** `backend/api.py`

Added `POST /api/assignments/<assignment_id>/create-sessions`:
- Triggered when user uploads materials
- Creates study sessions for the assignment
- Marks `materials_uploaded=True`
- Body: `{ "user_id": "uuid-here" }`

## How It Works Now

### Step 1: Calendar Sync (Automatic - Every 5 Minutes)
```
Agent → Google Calendar → MongoDB (calendar_events)
```
- Agent syncs calendar every 5 minutes
- Detects assignments using keywords
- Stores in MongoDB with `is_assignment=True`, `processed=False`

### Step 2: Assignment Creation & Notification (Automatic)
```
Agent → Create Assignment in Supabase → Send Email
```
- Agent checks for unprocessed assignments
- Creates assignment in Supabase with:
  - `materials_uploaded=False`
  - `notification_sent=False`
- Sends email to user asking for materials
- Marks `notification_sent=True`
- **Does NOT create study sessions yet**

### Step 3: User Uploads Materials (Manual)
```
User → Login → Upload Materials → Click "Create Study Plan"
```
- User receives email notification
- Logs into the application
- Navigates to the assignment
- Uploads slides, notes, instructions, etc.

### Step 4: Study Sessions Creation (Triggered by Upload)
```
Frontend → POST /api/assignments/{id}/create-sessions → Study Sessions Created
```
- When user uploads materials and clicks button
- Frontend calls API endpoint
- Backend creates study sessions based on:
  - Assignment type (exam: 5 sessions, quiz: 2 sessions, etc.)
  - Due date (evenly distributed)
  - Topics from assignment
- Marks `materials_uploaded=True`

## Testing Instructions

### Prerequisites
1. Backend is running: `python backend/api.py`
2. MongoDB connection is working
3. Google Calendar is authenticated (`token.json` exists)
4. Email credentials configured in `backend/.env`:
   ```
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=your-app-password
   USER_EMAIL=student@example.com
   ```

### Test Flow

#### 1. Add Test Event to Google Calendar
Add an event with keywords like:
- "Machine Learning Exam" (next week)
- "CS101 Quiz" (in 3 days)
- "Philosophy Essay Due" (in 5 days)

#### 2. Watch Agent Logs
Backend should show:
```
🤖 [AGENT] Auto-sync started at 10:30:00
✅ [AGENT] Calendar synced successfully
🧠 [AGENT] Checking for upcoming exams at 10:31:00
🔄 [AGENT] Syncing 1 new assignments to Supabase...
✅ Created assignment in Supabase: Machine Learning Exam
⚠️ Study sessions NOT created yet - waiting for user to upload materials
📧 [AGENT] Notification sent for: Machine Learning Exam
```

#### 3. Check Email
You should receive an email with:
- Subject: "🎯 New Assignment Detected: Machine Learning Exam"
- Instructions to login and upload materials
- Clear call-to-action button

#### 4. Verify in Supabase
Check `assignments` table:
```sql
SELECT title, materials_uploaded, notification_sent
FROM assignments
WHERE title LIKE '%Machine Learning%';
```
Should show:
- `materials_uploaded`: false
- `notification_sent`: true

#### 5. Test Study Session Creation
Call the API endpoint:
```bash
curl -X POST http://localhost:5001/api/assignments/<assignment-id>/create-sessions \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid-here"}'
```

Should return:
```json
{
  "success": true,
  "message": "Created 5 study sessions",
  "sessions_created": 5
}
```

#### 6. Verify Study Sessions Created
Check `study_sessions` table:
```sql
SELECT scheduled_at, focus, status
FROM study_sessions
WHERE assignment_id = '<assignment-id>';
```

## Frontend Integration Required

To complete the integration, the frontend needs to:

1. **Add Materials Upload UI**
   - On assignment detail page
   - File upload component (slides, PDFs, etc.)
   - Button: "Create Study Plan"

2. **Call the Create Sessions Endpoint**
   ```typescript
   // After materials are uploaded
   const response = await fetch(
     `http://localhost:5001/api/assignments/${assignmentId}/create-sessions`,
     {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ user_id: userId })
     }
   );
   ```

3. **Show Assignment Status**
   - Display whether materials are uploaded
   - Show if notification was sent
   - Indicate if study sessions exist

## Benefits of New Flow

✅ **User Control**: User must explicitly upload materials before sessions are created
✅ **Better Quality**: Study sessions based on actual course materials, not guesses
✅ **Clear Communication**: User knows exactly what to do via email
✅ **No Spam**: Only one notification per new assignment
✅ **Transparent**: All statuses tracked in database
✅ **Flexible**: User can upload materials at their convenience

## Email Configuration

To enable email notifications, configure `backend/.env`:

```env
# SMTP Configuration (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your.email@gmail.com
SENDER_PASSWORD=your-app-password  # Use Gmail App Password, not regular password
USER_EMAIL=student@example.com  # The student's email
```

### Getting Gmail App Password
1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate password for "Mail"
4. Copy the 16-character password
5. Use this in `SENDER_PASSWORD`

## Troubleshooting

### Assignments Not Appearing
- Check backend logs for sync errors
- Verify MongoDB connection
- Ensure user profile exists in Supabase
- Check `USER_EMAIL` matches profile email

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check sender email/password are correct
- Enable "Less secure app access" or use App Password
- Check backend logs for email errors

### Study Sessions Not Created
- Verify `/create-sessions` endpoint is called
- Check assignment ID is correct
- Ensure user_id is valid
- Check Supabase permissions (RLS policies)

### Database Migration Issues
Run migration manually:
```bash
# In Supabase SQL Editor
-- Run the contents of:
-- supabase/migrations/20251108140000_add_materials_tracking.sql
```

## Future Enhancements

Potential improvements:
1. Support multiple users (not just one USER_EMAIL)
2. Allow users to customize notification preferences
3. Parse materials to extract better topics
4. AI-powered session difficulty adjustment
5. Reminder emails for materials upload
6. Batch session creation for multiple assignments

## Files Changed

- ✅ `supabase/migrations/20251108140000_add_materials_tracking.sql` (NEW)
- ✅ `backend/email_service.py` (MODIFIED)
- ✅ `backend/assignment_sync.py` (MODIFIED)
- ✅ `backend/agentic_service.py` (MODIFIED)
- ✅ `backend/api.py` (MODIFIED)

## Summary

The agentic AI now correctly:
1. ✅ Detects assignments from calendar every 5 minutes
2. ✅ Creates assignments in "Your Assignments" page
3. ✅ Sends email notification prompting material upload
4. ✅ Waits for user to upload materials
5. ✅ Creates study sessions only after materials are uploaded
6. ✅ Tracks all state changes in the database

The system is now more user-friendly, transparent, and produces better quality study sessions!
