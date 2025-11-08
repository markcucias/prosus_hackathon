# 📧 Email Setup - REQUIRED FOR AGENTIC AI

## ✅ Good News!
- Backend code is **fixed** ✓
- Your email (`doe839319@gmail.com`) is configured ✓
- Just need Gmail App Password!

---

## 🚀 3-Minute Setup

### Step 1: Get Gmail App Password

1. **Open**: https://myaccount.google.com/apppasswords
2. **Sign in** with: `doe839319@gmail.com`
3. **Click** "Create" or "Generate"
4. **Select**:
   - App: **"Mail"**
   - Device: **"Windows Computer"**
5. **Click** "Generate"
6. **Copy** the 16-character password that appears
   - Example: `abcd efgh ijkl mnop`
   - **Remove the spaces** → `abcdefghijklmnop`

### Step 2: Edit `.env` File

1. **Open** in your editor: `backend\.env`
2. **Find** this line (around line 15):
   ```
   SENDER_PASSWORD=your_gmail_app_password_here
   ```
3. **Replace** with your password (no spaces):
   ```
   SENDER_PASSWORD=abcdefghijklmnop
   ```
4. **Save** the file (Ctrl+S)

### Step 3: Restart Backend

**In PowerShell** (in `backend` directory):
```bash
# Stop current backend (if running): Ctrl+C
python api.py
```

---

## ✅ Success Looks Like:

When you start the backend, you should see:

```
🚀 Starting Study Companion Calendar API...
📍 http://localhost:5001
------------------------------------------------------------

🤖 Initializing Agentic Study Companion...

============================================================
🤖 STARTING AGENTIC STUDY COMPANION
============================================================
📧 User Email: doe839319@gmail.com
⏰ Sync Interval: Every 5 minutes
🔍 Monitoring: Exams within 7 days
🧠 AI Mode: AUTONOMOUS (Proactive Notifications)
============================================================

✅ Agentic AI Agent is now active!
   Next sync: 16:30:15
   Next check: 16:31:15
```

---

## 🧪 Test It!

### Test 1: Check Dashboard
- Go to: http://localhost:8080
- Look for **"Agentic AI Status"** card
- Should show: ✅ **ACTIVE** (green badge)

### Test 2: Send Test Email
Open new terminal:
```bash
curl -X POST http://localhost:5001/api/email/test -H "Content-Type: application/json" -d "{\"user_email\": \"doe839319@gmail.com\"}"
```

Check your inbox! You should receive a test email.

### Test 3: Create Test Exam
1. Open Google Calendar
2. Add event:
   - **Title**: "Machine Learning Exam"
   - **Date**: 6 days from today
3. Wait 5 minutes
4. Check your email for proactive reminder! 📧

---

## 🐛 Troubleshooting

### "Authentication failed"
- **Problem**: Wrong password or not an App Password
- **Fix**: Generate a NEW App Password from Gmail
- **Note**: Use the App Password, not your regular Gmail password!

### "Email credentials not configured"
- **Problem**: `.env` file not updated
- **Fix**: Make sure you saved the `.env` file after editing

### Agent shows "STOPPED" on dashboard
- **Problem**: Backend not running
- **Fix**: Run `python api.py` in backend directory

---

## 📖 Next Steps

Once email is working:

1. ✅ **Backend running** with agent ACTIVE
2. 🎯 **Dashboard shows** agent status
3. 📧 **Test email** sent successfully
4. 📅 **Create test exam** in calendar
5. ⏰ **Wait 5 minutes** for auto-sync
6. 📬 **Receive email** reminder
7. 🎉 **Agentic AI working!**

---

## 🎯 For Hackathon Demo

Once working, you can demonstrate:
- **Autonomous behavior** (no manual sync needed)
- **Proactive emails** (AI takes initiative)
- **Real-time monitoring** (dashboard shows live status)
- **Complete workflow** (detect → email → upload → generate → study)

**True agentic AI!** 🤖

---

Need help? Check:
- `AGENTIC_AI_QUICKSTART.md` - Full quick start guide
- `backend/AGENTIC_AI_SETUP.md` - Detailed documentation

