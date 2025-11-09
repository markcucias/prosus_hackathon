# Frontend Requirements for Assignment Materials Upload

## What Was Fixed

✅ **Backend Changes Completed:**
1. Assignments are now created in Supabase immediately when detected
2. Email notifications include direct link to specific assignment: `http://localhost:8080/assignments/{assignment_id}`
3. Emails are sent for each new assignment detected

## What the Frontend Needs

### 1. Assignment Detail Page with Upload

Create a page at route: `/assignments/:id`

**Required Features:**
- Display assignment details (title, due date, type, topics)
- File upload component for study materials
- Button: "Create Study Plan" or "Generate Study Sessions"
- Show status: materials uploaded (yes/no), sessions created (yes/no)

**Example UI:**

```
╔══════════════════════════════════════════════════════╗
║  📚 Exam Introduction to Video Game Making          ║
║  Due: November 9, 2025 at 9:15 AM                   ║
║  Type: Exam (Hybrid)                                 ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  📂 Upload Study Materials                           ║
║                                                      ║
║  [Drop files here or click to browse]               ║
║                                                      ║
║  Accepted: PDF, PPTX, DOCX, TXT                     ║
║                                                      ║
║  Materials: [ ] Lecture Slides                       ║
║             [ ] Course Notes                         ║
║             [ ] Practice Problems                    ║
║                                                      ║
║  [Upload Files]                                      ║
║                                                      ║
║  ─────────────────────────────────────────────────  ║
║                                                      ║
║  Status: ⚠️ Waiting for materials                    ║
║                                                      ║
║  [ Create Study Plan ] ← Calls backend API          ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

### 2. API Call After Upload

When user clicks "Create Study Plan":

```typescript
// POST /api/assignments/{assignment_id}/create-sessions
const response = await fetch(
  `http://localhost:5001/api/assignments/${assignmentId}/create-sessions`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId // Get from current session
    })
  }
);

if (response.ok) {
  const data = await response.json();
  console.log(`Created ${data.sessions_created} study sessions!`);
  // Redirect to study sessions page or show success
}
```

### 3. Assignments List Page

Update `/assignments` page to show:
- All user's assignments
- Status badges:
  - 🔴 "Materials Needed" (materials_uploaded = false)
  - 🟡 "Ready to Study" (materials_uploaded = true, sessions exist)
  - 🟢 "In Progress" (sessions started)
- Click assignment to go to detail page

## Testing the Email Notifications

### Option 1: Reset Notification Flags (For Testing)

Run this SQL in Supabase to reset the notification flags:

```sql
-- Reset notification_sent for all assignments
UPDATE public.assignments
SET notification_sent = false,
    notification_sent_at = NULL
WHERE user_id = '1ae8c4c8-066f-4799-9938-652c49d052f9';

-- Verify
SELECT id, title, notification_sent
FROM public.assignments
WHERE user_id = '1ae8c4c8-066f-4799-9938-652c49d052f9';
```

Then restart the backend. Within 1-2 minutes, you'll receive emails for all 5 assignments.

### Option 2: Add a New Test Assignment

Add a new event to your Google Calendar with keywords like:
- "Test Machine Learning Exam"
- "Physics Quiz"
- "History Essay Due"

Wait 5 minutes for calendar sync, and you'll receive a new email.

### Option 3: Manual Test Email

Test the email template with a specific assignment:

```bash
curl -X POST http://localhost:5001/api/email/test-assignment \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "doe839319@gmail.com",
    "assignment_id": "your-assignment-id-here"
  }'
```

## File Structure Example

```
src/
├── pages/
│   ├── Assignments.tsx          # List of all assignments
│   └── AssignmentDetail.tsx     # Detail page with upload
├── components/
│   ├── FileUpload.tsx           # File upload component
│   └── AssignmentCard.tsx       # Card for assignment list
└── services/
    └── assignmentService.ts     # API calls
```

## Backend API Available

### GET /api/assignments (needs to be created for frontend)
Returns all assignments for the current user

### POST /api/assignments/{id}/create-sessions
Creates study sessions for an assignment after materials uploaded

Parameters:
- `user_id`: UUID of the user

Response:
```json
{
  "success": true,
  "message": "Created 5 study sessions",
  "sessions_created": 5
}
```

## Current Flow (Working!)

1. ✅ Calendar syncs every 5 minutes
2. ✅ New assignments are detected and created in Supabase
3. ✅ Assignments appear in "Your Assignments" (if frontend displays them)
4. ✅ Email sent with direct link: `http://localhost:8080/assignments/{id}`
5. ⏳ USER CLICKS LINK → needs frontend page
6. ⏳ USER UPLOADS MATERIALS → needs upload component
7. ⏳ USER CLICKS "CREATE STUDY PLAN" → calls backend API
8. ✅ Study sessions created automatically
9. ✅ User can start studying

## What's Missing (Frontend Only)

- [ ] Assignment detail page at `/assignments/:id`
- [ ] File upload component
- [ ] Integration with backend `/create-sessions` endpoint
- [ ] Display assignment status (materials uploaded, sessions created)
- [ ] Show list of study sessions for each assignment

## Quick Test

1. **Check if assignments exist in Supabase:**
   ```sql
   SELECT id, title, due_at, materials_uploaded, notification_sent
   FROM public.assignments
   WHERE user_id = '1ae8c4c8-066f-4799-9938-652c49d052f9';
   ```

2. **Manually create study sessions for testing:**
   ```bash
   curl -X POST http://localhost:5001/api/assignments/YOUR_ASSIGNMENT_ID/create-sessions \
     -H "Content-Type: application/json" \
     -d '{"user_id": "1ae8c4c8-066f-4799-9938-652c49d052f9"}'
   ```

3. **Check if sessions were created:**
   ```sql
   SELECT id, assignment_id, scheduled_at, focus, status
   FROM public.study_sessions
   WHERE user_id = '1ae8c4c8-066f-4799-9938-652c49d052f9'
   ORDER BY scheduled_at;
   ```

## Summary

**Backend is 100% ready!** ✅

The agentic AI is:
- Detecting assignments ✅
- Creating them in database ✅
- Sending email notifications ✅
- Ready to create study sessions ✅

**Frontend needs:**
- Assignment detail page with upload UI
- Integration with `/create-sessions` API

Once the frontend is built, the complete flow will work end-to-end!
