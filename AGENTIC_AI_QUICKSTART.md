# 🤖 Agentic AI Study Companion - Quick Start

## ✨ What's New?

Your Study Companion is now **AUTONOMOUS**! 

The AI now:
- 🔄 **Auto-syncs** your Google Calendar every 5 minutes (no manual clicking!)
- 🧠 **Detects** upcoming exams automatically (7 days in advance)
- 📧 **Sends proactive emails** asking you to prepare study materials
- 🤖 **Works 24/7** without any manual intervention

This is **true agentic AI** - it takes initiative on your behalf!

---

## 🚀 Setup (5 Minutes)

### Step 1: Configure Email (IMPORTANT!)

#### For Gmail Users (Recommended):

1. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in with your Google account
   - Click "Create" and select:
     - App: "Mail"
     - Device: "Windows Computer"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

2. **Update `.env` file**:
   - Open `backend/.env`
   - Replace placeholders with your info:

```env
USER_EMAIL=your.email@gmail.com
SENDER_EMAIL=your.email@gmail.com
SENDER_PASSWORD=abcdefghijklmnop  # Your 16-char app password (no spaces!)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

#### For Other Email Providers:

**Outlook/Hotmail**:
```env
SENDER_EMAIL=your.email@outlook.com
SENDER_PASSWORD=your_password
SMTP_SERVER=smtp.outlook.com
SMTP_PORT=587
```

**Yahoo**:
```env
SENDER_EMAIL=your.email@yahoo.com
SENDER_PASSWORD=your_password
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Step 2: Start the Agentic Backend

Open a **NEW terminal** (keep your React dev server running):

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

### Step 3: Test It!

1. **Check Agent Status**:
   - Go to your dashboard: http://localhost:8080
   - You'll see a new **"Agentic AI Status"** card showing:
     - ✅ ACTIVE badge
     - Last sync time
     - Reminders sent count
     - Next sync/check times

2. **Test Email** (Optional):
   ```bash
   curl -X POST http://localhost:5001/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"user_email": "your.email@gmail.com"}'
   ```
   
   Check your inbox for a test email!

3. **Create a Test Exam**:
   - Open Google Calendar
   - Add event: **"Machine Learning Exam"**
   - Date: **6 days from today**
   - Wait 5 minutes → Check your email! 📧

---

## 📧 What the Emails Look Like

When the AI detects an exam 7 days out, you'll receive:

**Subject**: 📚 Exam Alert: Machine Learning Exam in 7 days!

**Body** (beautiful HTML email):
> Hi there! 👋
>
> I noticed you have an exam coming up soon:
>
> 📚 Exam: Machine Learning Exam
> 📅 Date: November 20, 2025
> ⏰ Time until exam: 7 days
>
> I'm ready to help you prepare! To create a personalized study plan, I need some materials:
>
> 🔹 Lecture slides
> 🔹 Course instructions  
> 🔹 Practice problems
>
> **[Log In & Upload Materials →]**
>
> Let's ace this exam together! 🚀

---

## 🎯 How It Works (Autonomous Workflow)

```
Every 5 minutes (AUTOMATIC):
  ↓
  1. 🔄 Sync Google Calendar → MongoDB
  ↓
  2. 🧠 AI analyzes events for exams
  ↓
  3. 📅 Finds exams within 7 days
  ↓
  4. 📧 Sends personalized email
  ↓
  5. ✅ Marks as notified (no spam)
  ↓
  6. 😴 Sleeps until next cycle
  ↓
  (Repeats forever - NO USER ACTION NEEDED!)
```

---

## 🔍 Monitoring the Agent

### Dashboard (Visual)
- Open: http://localhost:8080
- Look for the **"Agentic AI Status"** card
- Shows real-time status and next sync times

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/status` | GET | Get agent status |
| `/api/agent/start` | POST | Start agent |
| `/api/agent/stop` | POST | Stop agent |
| `/api/email/test` | POST | Send test email |

### Quick Status Check:
```bash
curl http://localhost:5001/api/agent/status
```

---

## 🐛 Troubleshooting

### ❌ "Email credentials not configured"
- **Fix**: Edit `backend/.env`
- Set `SENDER_EMAIL` and `SENDER_PASSWORD`
- For Gmail: Use **App Password**, not regular password!

### ❌ "Authentication failed"
- **Gmail**: Generate a NEW App Password
- **Others**: Enable "less secure apps" or SMTP access

### ❌ Agent shows "STOPPED"
- **Fix**: Backend not running
- Run: `python backend/api.py`

### ❌ No emails received
- Check **spam folder**
- Verify `USER_EMAIL` in `.env`
- Test: `POST /api/email/test`

### ❌ "Agent Offline" on dashboard
- **Fix**: Backend not running
- Start backend: `cd backend && python api.py`

---

## 💡 Pro Tips

### 1. Keep Backend Running
- The backend must stay running for autonomous behavior
- Don't close the terminal!

### 2. Check Logs
- Watch the backend terminal for sync activity
- Every 5 minutes you'll see sync logs

### 3. Adjust Timing
Edit `backend/agentic_service.py`:
```python
SYNC_INTERVAL_MINUTES = 5   # Change to 10 for less frequent
CHECK_DAYS_AHEAD = 7         # Change to 14 for 2-week notice
```

### 4. Production Deployment
For hackathon demo, run backend in background:
```bash
# Windows
Start-Process -NoNewWindow python api.py

# Mac/Linux  
nohup python api.py > agent.log 2>&1 &
```

---

## 🎓 Hackathon Demo Script

1. **Show Dashboard**:
   - Point out "Agentic AI Status" card
   - Show "ACTIVE" badge
   - Emphasize "no manual action required"

2. **Show Backend Logs**:
   - Open terminal with auto-sync logs
   - Wait for next 5-minute sync cycle
   - Point out autonomous behavior

3. **Show Email**:
   - Display received email on screen
   - Highlight beautiful HTML formatting
   - Show call-to-action button

4. **Emphasize "Agentic"**:
   - "The AI takes initiative"
   - "Proactive, not reactive"
   - "Works 24/7 autonomously"
   - "True agentic behavior"

---

## 📊 Full Workflow Demo

1. ✅ **Agent detects exam** (from Google Calendar)
2. 📧 **Sends proactive email** (7 days in advance)
3. 🖱️ **User clicks link** (logs into dashboard)
4. 📄 **User uploads slides** (study materials)
5. 🤖 **AI generates questions** (personalized)
6. 📅 **AI creates study schedule** (optimized)
7. 📈 **User studies & tracks progress**

**Complete agentic loop!** 🎯

---

## 📁 File Structure

```
backend/
├── api.py                    # Flask server (starts agent)
├── agentic_service.py       # Autonomous AI agent
├── email_service.py         # Email notifications
├── database.py              # MongoDB operations
├── calendar_reader.py       # Google Calendar sync
├── .env                     # YOUR CONFIG (edit this!)
├── env.example              # Template
└── AGENTIC_AI_SETUP.md     # Full documentation

src/
├── components/
│   └── AgentStatus.tsx      # Dashboard status widget
└── pages/
    └── Dashboard.tsx        # Shows agent status
```

---

## ✅ Checklist

Before demo:
- [ ] Backend running (`python backend/api.py`)
- [ ] `.env` file configured with your email
- [ ] Test email sent successfully
- [ ] Dashboard shows "ACTIVE" status
- [ ] Google Calendar connected
- [ ] Test exam created (6 days out)
- [ ] Received test email reminder

---

## 🚀 Ready to Demo!

Once you see this in your terminal:

```
✅ Agentic AI Agent is now active!
```

And this on your dashboard:

```
✅ ACTIVE
```

**You're good to go!** The AI is working autonomously. 🎉

---

## 📖 More Info

- Full docs: `backend/AGENTIC_AI_SETUP.md`
- Questions? Check troubleshooting section above
- Email issues? See Gmail App Password instructions

Built for **AI University Games Hackathon 2024** 🏆

