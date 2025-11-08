# 🤖 Agentic AI Study Companion - Setup Guide

## ✨ What is "Agentic AI"?

Your Study Companion is now **fully autonomous** and **proactive**:

- 🔄 **Auto-syncs** your Google Calendar every 5 minutes
- 🧠 **Detects** upcoming exams automatically (7 days in advance)
- 📧 **Sends proactive emails** asking you to prepare study materials
- 🎯 **Takes initiative** without you having to manually check anything

This is true **agentic AI** - it acts independently on your behalf!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Email Notifications

#### Option A: Gmail (Recommended)

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in with your Google account
3. Create a new app password:
   - App: "Study Companion"
   - Device: "Windows Computer"
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Option B: Other Email Providers

- **Outlook/Hotmail**: Use `smtp.outlook.com`, port `587`
- **Yahoo**: Use `smtp.mail.yahoo.com`, port `587`
- Enable "Allow less secure apps" or create an app password

### Step 3: Create `.env` File

Create `backend/.env` with your credentials:

```env
# Your email (where you'll receive notifications)
USER_EMAIL=your.email@gmail.com

# Gmail SMTP settings
SENDER_EMAIL=your.email@gmail.com
SENDER_PASSWORD=your_16_char_app_password_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

💡 **Tip**: Copy `backend/env.example` and rename it to `.env`

---

## 🎯 How to Run

### Start the Agentic Backend

```bash
cd backend
python api.py
```

You should see:

```
🤖 STARTING AGENTIC STUDY COMPANION
============================================================
📧 User Email: your.email@gmail.com
⏰ Sync Interval: Every 5 minutes
🔍 Monitoring: Exams within 7 days
🧠 AI Mode: AUTONOMOUS (Proactive Notifications)
============================================================

✅ Agentic AI Agent is now active!
   Next sync: 16:30:15
   Next check: 16:31:15
```

**That's it!** The AI is now running autonomously in the background. 🎉

---

## 📧 What Emails Look Like

When an exam is detected 7 days out, you'll receive:

**Subject**: 📚 Exam Alert: Machine Learning Final in 7 days!

**Body**:
> Hi there! 👋
>
> I noticed you have an exam coming up soon:
>
> 📚 Exam: Machine Learning Final
> 📅 Date: November 20, 2025
> ⏰ Time until exam: 7 days
>
> I'm ready to help you prepare! To create a personalized study plan, I need some materials:
>
> 🔹 Lecture slides
> 🔹 Course instructions
> 🔹 Practice problems or past exams
>
> Please log in to your Study Companion dashboard and upload these materials so I can:
> ✅ Generate personalized practice questions
> ✅ Create an optimized study schedule
> ✅ Track your progress and adapt difficulty
>
> 👉 Log in here: http://localhost:8080
>
> Let's ace this exam together! 🚀

---

## 🔍 Monitoring the Agent

### Check Agent Status

Visit: `http://localhost:5001/api/agent/status`

Response:
```json
{
  "success": true,
  "agent": {
    "is_running": true,
    "last_sync": "2025-11-08T16:30:00",
    "notifications_sent": 3,
    "next_sync": "2025-11-08T16:35:00",
    "next_check": "2025-11-08T16:36:00"
  }
}
```

### Test Email Configuration

```bash
curl -X POST http://localhost:5001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"user_email": "your.email@gmail.com"}'
```

---

## 🎛️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/status` | GET | Get agent status |
| `/api/agent/start` | POST | Start agent manually |
| `/api/agent/stop` | POST | Stop agent |
| `/api/email/test` | POST | Send test email |
| `/api/calendar/sync` | POST | Manual sync (agent does this automatically) |
| `/api/assignments/upcoming` | GET | View upcoming assignments |

---

## ⚙️ Configuration

### Adjust Sync Frequency

Edit `backend/agentic_service.py`:

```python
SYNC_INTERVAL_MINUTES = 5  # Change to 10 for every 10 minutes
CHECK_DAYS_AHEAD = 7       # Change to 14 for 2 weeks notice
```

### Customize Email Template

Edit `backend/email_service.py` to change:
- Email subject line
- Email body content
- HTML styling

---

## 🧪 Testing the System

### 1. Add a Test Event to Google Calendar

1. Open Google Calendar
2. Create new event:
   - **Title**: "Machine Learning Exam"
   - **Date**: 6 days from now
3. Save event

### 2. Wait for Auto-Sync

The agent will automatically sync within 5 minutes.

Or manually trigger: `http://localhost:5001/api/calendar/sync`

### 3. Check Your Email

Within 1-2 minutes after sync, you should receive a proactive reminder email!

---

## 🐛 Troubleshooting

### "Email credentials not configured"

- Make sure you created `backend/.env`
- Check that `SENDER_EMAIL` and `SENDER_PASSWORD` are set
- For Gmail, use an **App Password**, not your regular password

### "Failed to send email: Authentication failed"

- Gmail: Generate a new App Password
- Other providers: Enable "less secure apps" or SMTP access

### "Agent not running"

- Check backend terminal for errors
- Visit `http://localhost:5001/api/agent/status`
- Restart backend: `python api.py`

### "No emails received"

- Check spam folder
- Verify `USER_EMAIL` in `.env` is correct
- Test email: `POST /api/email/test`

---

## 🎓 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                  AGENTIC AI WORKFLOW                     │
└─────────────────────────────────────────────────────────┘

Every 5 minutes:
  ↓
  1. 🔄 Sync Google Calendar → MongoDB
  ↓
  2. 🧠 Analyze events for exams/assignments
  ↓
  3. 📅 Find exams within 7 days
  ↓
  4. 📧 Send proactive email reminders
  ↓
  5. ✅ Mark as notified (avoid spam)
  ↓
  6. 😴 Sleep until next cycle
  ↓
  (Repeat forever)
```

**You never have to click anything!** The AI works 24/7 in the background. 🤖

---

## 🚀 Production Deployment

For hackathon demo or production:

### Option 1: Keep Running Locally

```bash
cd backend
python api.py
```

Keep this terminal open. Agent runs continuously.

### Option 2: Run as Background Service

**Windows**:
```powershell
Start-Process -NoNewWindow python api.py
```

**Mac/Linux**:
```bash
nohup python api.py > agent.log 2>&1 &
```

### Option 3: Deploy to Cloud

- Deploy to Heroku/Railway/Render
- Agent will run automatically on server
- Set environment variables in cloud dashboard

---

## 📊 Demo Tips for Hackathon

1. **Show the autonomous behavior**:
   - Open backend terminal showing auto-sync logs
   - Refresh every 5 minutes
   - Point out "no user action required"

2. **Create a test exam**:
   - Add "Machine Learning Exam" to calendar (6 days out)
   - Wait 5 minutes for auto-sync
   - Show the email that arrives

3. **Emphasize "Agentic AI"**:
   - "The AI takes initiative"
   - "Proactive, not reactive"
   - "Works 24/7 without human input"
   - "True autonomous agent behavior"

4. **Show the email**:
   - Display the beautiful HTML email
   - Highlight personalized content
   - Point out call-to-action

---

## 🎯 Next Steps

Once email reminders are working:

1. ✅ User receives email
2. 🖱️ User clicks link → logs into dashboard
3. 📄 User uploads lecture slides
4. 🤖 AI generates personalized questions
5. 📊 AI creates optimized study schedule
6. 🎓 User studies and tracks progress

**The full agentic loop!** 🚀

---

## 📝 License & Credits

Built for AI University Games Hackathon 2024

