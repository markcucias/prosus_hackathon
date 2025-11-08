# 🚀 Start Backend Server - Quick Guide

## ⚠️ You're Getting Connection Refused Because:

The Flask API server isn't running yet! React is trying to connect to `http://localhost:5001` but nothing is there.

---

## ✅ Start Backend (2 Steps)

### Step 1: Install Dependencies (First Time Only)

Open a **NEW terminal** (keep React running in the other one):

```bash
cd backend
pip install -r requirements.txt
```

**Wait for installation...** (takes 30-60 seconds)

---

### Step 2: Start the API Server

```bash
python api.py
```

You should see:
```
🚀 Starting Study Companion Calendar API...
📍 http://localhost:5001
------------------------------------------------------------
 * Serving Flask app 'api'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:5001
```

**✅ If you see this, backend is running!**

---

## 🧪 Test It's Working

### Option 1: Browser
Open: http://localhost:5001/health

Should show:
```json
{
  "service": "Study Companion Calendar API",
  "status": "ok"
}
```

### Option 2: Terminal
```bash
# In another terminal
curl http://localhost:5001/health
```

---

## 🎯 Now Try Calendar Sync Again

1. **Keep backend running** in one terminal
2. **Keep React running** in another terminal (`npm run dev`)
3. Go back to browser
4. Click **"Sync Google Calendar"**
5. Should work now! ✅

---

## 📊 You Should Now Have:

### Terminal 1: React Dev Server
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Terminal 2: Python Backend
```
🚀 Starting Study Companion Calendar API...
 * Running on http://0.0.0.0:5001
```

**Both need to be running!**

---

## 🐛 Still Not Working?

### "pip: command not found"
Use `pip3` instead:
```bash
pip3 install -r requirements.txt
python3 api.py
```

### "No module named 'flask'"
Install dependencies:
```bash
pip install flask flask-cors pymongo supabase google-auth google-auth-oauthlib google-api-python-client
```

### "Cannot import name X"
Make sure you're in the `backend/` folder:
```bash
pwd  # Should show: .../smart-study-buddy-22/backend
ls   # Should show: api.py, database.py, etc.
```

### Port 5001 already in use
Change port in `api.py` (last line):
```python
app.run(host='0.0.0.0', port=5002, debug=True)
```

And in `CalendarSync.tsx`:
```typescript
const BACKEND_URL = 'http://localhost:5002';
```

---

## 🎉 Once Backend Starts:

Go back to React app and:
1. Click "Sync Google Calendar"
2. Should show: "Fetching events from your Google Calendar..."
3. Then: "Synced X events!"
4. You'll see detected assignments
5. Click "Create X Assignments"

**You're ready! 🚀**

