# Smart Study Buddy - Complete Setup Instructions

## Current Issue

The agentic AI cannot sync assignments because the Supabase Row Level Security (RLS) policies prevent the backend from querying user profiles. The backend uses the `anon` key, which can only access data for authenticated users.

## Solution

There are 3 steps to fix this:

### Step 1: Apply Database Migration

The migration adds new columns for tracking materials upload and notifications.

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/dpyvbkrfasiskdrqimhf
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Paste this SQL:

```sql
-- Add fields to track materials upload and email notification status
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS materials_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS materials_uploaded_at TIMESTAMPTZ;

-- Create index for querying assignments needing notification
CREATE INDEX IF NOT EXISTS idx_assignments_notification_pending
ON public.assignments(notification_sent, created_at)
WHERE notification_sent = FALSE;

-- Add comments
COMMENT ON COLUMN public.assignments.materials_uploaded IS 'Tracks whether user has uploaded study materials';
COMMENT ON COLUMN public.assignments.notification_sent IS 'Tracks whether email notification was sent';

SELECT 'Migration applied successfully!' as status;
```

5. Click "Run"
6. You should see: "Migration applied successfully!"

### Step 2: Update RLS Policy for Backend Access

The backend needs to query profiles by email. Add this policy:

1. In Supabase Dashboard, go to "Authentication" → "Policies"
2. Find the `profiles` table
3. Click "New Policy"
4. Choose "Create a custom policy"
5. Paste this:

```sql
-- Allow backend to query profiles by email
-- This is needed for the agentic AI to find users
CREATE POLICY "Allow anon to read profiles by email"
ON public.profiles
FOR SELECT
TO anon
USING (true);
```

**Note:** This allows reading all profiles with the anon key. For production, you should use a service_role key instead. But for development/hackathon, this works.

**Alternative (More Secure):** Get the service_role key and use it in the backend:

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT the anon key)
3. Update `backend/.env`:
   ```env
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```
4. Update `backend/assignment_sync.py` to use service_role key for backend operations

### Step 3: Ensure User Profile Exists

You must sign up in the app for the profile to be created.

1. **Sign Up in the App:**
   - Open browser: http://localhost:8080
   - Sign up with:
     - Email: `doe839319@gmail.com`
     - Password: `h@ckathon!2#`

2. **Verify Profile Created:**
   After signing up, check Supabase Dashboard → Authentication → Users
   - You should see your user listed
   - Then check Table Editor → profiles
   - Your profile should be there

3. **If Profile Wasn't Created (Trigger Issue):**

   Run this SQL in Supabase SQL Editor:

   ```sql
   -- Manually create profile if trigger didn't fire
   INSERT INTO public.profiles (id, email, full_name)
   SELECT
     id,
     email,
     COALESCE(raw_user_meta_data->>'full_name', email)
   FROM auth.users
   WHERE email = 'doe839319@gmail.com'
   ON CONFLICT (id) DO NOTHING;

   -- Verify it was created
   SELECT * FROM public.profiles WHERE email = 'doe839319@gmail.com';
   ```

### Step 4: Verify Email Configuration

Check `backend/.env` has correct settings:

```env
USER_EMAIL=doe839319@gmail.com
SENDER_EMAIL=doe839319@gmail.com
SENDER_PASSWORD=qcokkdvzyhskelwo
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

✅ I've already fixed the app password typo in your .env file!

### Step 5: Test the Flow

1. **Start the Backend:**
   ```bash
   python backend/api.py
   ```

2. **Watch the Logs:**
   You should see:
   ```
   🤖 [AGENT] Auto-sync started at XX:XX:XX
   ✅ [AGENT] Calendar synced successfully
   🧠 [AGENT] Checking for upcoming exams at XX:XX:XX
   🔄 [AGENT] Syncing X new assignments to Supabase...
   ✅ [AGENT] Created X assignments in 'Your assignments' tab
   📧 [AGENT] Notification sent for: [Assignment Name]
   ```

3. **Check Your Email:**
   You should receive an email for each new assignment asking you to upload materials.

4. **Check Supabase:**
   Go to Table Editor → assignments
   - You should see 5 assignments
   - `notification_sent` should be `true`
   - `materials_uploaded` should be `false`

## How the Flow Works Now

### 1. Calendar Sync (Every 5 Minutes)
```
Google Calendar → MongoDB → Detects 5 assignments
```

### 2. Assignment Creation (Automatic)
```
MongoDB → Supabase assignments table
- Creates assignment
- Sets materials_uploaded=false
- Sets notification_sent=false
```

### 3. Email Notification (Automatic)
```
For each new assignment:
- Sends email asking user to upload materials
- Marks notification_sent=true
```

### 4. Materials Upload (Manual - User Action)
```
User logs in → Uploads slides/notes → Clicks "Create Study Plan"
```

### 5. Study Sessions Created (Triggered by Upload)
```
Frontend → POST /api/assignments/{id}/create-sessions
- Creates 2-5 study sessions based on assignment type
- Marks materials_uploaded=true
```

## Current Assignment Detection

Your calendar has **5 assignments** detected:
1. Exam Introduction to Video Game Making (Nov 9)
2. Computer Vision Quiz (Nov 11)
3. Natural Language Processing Assignment (Nov 12)
4. Generative AI Quiz (Nov 13)
5. Exam Human Computer Interaction (Nov 14)

Once you complete the setup steps above, these will:
1. ✅ Appear in "Your Assignments" page
2. ✅ Send you 5 email notifications
3. ⏳ Wait for you to upload materials
4. ⏳ Create study sessions after materials uploaded

## Troubleshooting

### Issue: "User not found" error
**Solution:** Complete Step 2 (RLS Policy) AND Step 3 (User Signup)

### Issue: No emails received
**Check:**
- Gmail app password is correct: `qcokkdvzyhskelwo`
- Check spam folder
- Run test: `curl -X POST http://localhost:5001/api/email/test -H "Content-Type: application/json" -d '{"user_email":"doe839319@gmail.com"}'`

### Issue: Assignments not appearing
**Check:**
- Backend is running: `python backend/api.py`
- User profile exists in Supabase
- Check backend logs for errors
- Wait 5 minutes for next auto-sync OR trigger manual sync from web UI

### Issue: Migration not applied
**Symptom:** Error about columns not existing
**Solution:** Run Step 1 SQL in Supabase Dashboard

## Quick Start Checklist

- [ ] Step 1: Run migration SQL in Supabase
- [ ] Step 2: Add RLS policy for backend access
- [ ] Step 3: Sign up in app OR manually create profile
- [ ] Step 4: Verify .env has correct email config
- [ ] Step 5: Start backend and watch logs
- [ ] Step 6: Check email for notifications
- [ ] Step 7: Upload materials for one assignment
- [ ] Step 8: Verify study sessions were created

## Need Help?

1. Check backend logs: Look for emoji indicators (🤖 🧠 ✅ ❌)
2. Check Supabase logs: Dashboard → Logs
3. Test email: Use the `/api/email/test` endpoint
4. Verify profile: Check `profiles` table in Supabase

Good luck! 🚀
