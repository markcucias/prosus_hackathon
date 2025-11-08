# Quick Start Guide - Get Your Agentic AI Working in 3 Steps

## Current Status
✅ Backend code is ready
✅ Email credentials are configured
✅ 5 assignments detected in your calendar
⏳ Database needs to be set up
⏳ User profile needs to be created

## The 3 Steps to Get Everything Working

### Step 1: Set Up Database (2 minutes)

1. **Go to Supabase Dashboard:**
   - Open: https://supabase.com/dashboard/project/dpyvbkrfasiskdrqimhf
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

2. **Copy the SQL:**
   - Open the file: `COMPLETE_DATABASE_SETUP.sql` in your project
   - Copy ALL the SQL (entire file)
   - Paste it into the Supabase SQL Editor

3. **Run it:**
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for it to complete (~5 seconds)
   - You should see a success message showing:
     ```
     status: "Setup complete!"
     total_profiles: 0 (or more if you already signed up)
     materials_column_exists: "YES"
     backend_policy_exists: "YES"
     ```

✅ **Database is now ready!**

### Step 2: Create Your User Account (1 minute)

1. **Open the app:**
   - Go to: http://localhost:8080

2. **Sign up:**
   - Click "Sign Up" (or "Get Started")
   - Enter:
     - Email: `doe839319@gmail.com`
     - Password: `h@ckathon!2#`
   - Submit the form

3. **You should be logged in!**
   - Your profile is automatically created in the database

✅ **User profile created!**

### Step 3: Start the Backend (30 seconds)

1. **Open terminal in your project directory**

2. **Run the backend:**
   ```bash
   python backend/api.py
   ```

3. **Watch the magic happen!**
   Within 1-2 minutes, you should see:
   ```
   🤖 [AGENT] Auto-sync started
   ✅ [AGENT] Calendar synced successfully
   🧠 [AGENT] Checking for upcoming exams
   🔄 [AGENT] Syncing 5 new assignments to Supabase...
   ✅ [AGENT] Created 5 assignments
   📧 [AGENT] Notification sent for: Exam Introduction to Video Game Making
   📧 [AGENT] Notification sent for: Computer Vision Quiz
   ...
   ```

4. **Check your email!**
   - You should receive 5 emails
   - Each email asks you to upload study materials

✅ **Everything is working!**

---

## Your 5 Detected Assignments

1. 📚 Exam Introduction to Video Game Making - Nov 9
2. 📚 Computer Vision Quiz - Nov 11
3. 📚 Natural Language Processing Assignment - Nov 12
4. 📚 Generative AI Quiz - Nov 13
5. 📚 Exam Human Computer Interaction - Nov 14

---

## Need Help?

If you get errors, check:
- Backend logs for specific error messages
- Supabase Dashboard → Logs
- All 3 steps completed correctly
