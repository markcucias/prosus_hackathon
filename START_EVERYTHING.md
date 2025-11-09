# Complete Startup Guide - Fix Everything

## THE PROBLEM

Your **frontend** and **backend** were using different Supabase databases:
- Frontend was using: `dpyvbkrfasiskdrqimhf` (OLD - has only 5 assignments)
- Backend was using: `lcpexhkqaqftaqdtgebp` (CORRECT - has 44 assignments)

**I've fixed the frontend `.env` file**, but you need to restart everything for changes to take effect.

---

## STEP-BY-STEP FIX

### STEP 1: Stop Everything

In PowerShell:
1. **Stop Frontend**: Find the terminal running `npm run dev` and press `Ctrl+C`
2. **Stop Backend**: Find the terminal running `python backend/api.py` and press `Ctrl+C`

### STEP 2: Verify Database Setup (IMPORTANT!)

1. Go to: https://lcpexhkqaqftaqdtgebp.supabase.co
2. Click **SQL Editor**
3. Click **+ New query**
4. Copy the contents of `COMPLETE_VERIFICATION.sql`
5. Paste and click **Run**

**Look at the SUMMARY result:**
- `has_profile`: Should be **1**
- `your_assignments`: Should be **44** (or close to it)
- `total_assignments`: Should be **44**

**If `has_profile` is 0:**
- You don't have an account in the correct database yet
- You'll need to sign up again (see STEP 4)

**If `your_assignments` is 0 but `total_assignments` is 44:**
- The assignments belong to a different user
- This is a user ID mismatch issue (I'll fix it)

### STEP 3: Restart Backend

In PowerShell:
```powershell
cd C:\Users\alios\OneDrive\Plocha\Lovable\smart-study-buddy-22
python backend/api.py
```

**Wait for:**
```
🚀 Starting Study Companion Calendar API...
📍 http://localhost:5001
🤖 Initializing Agentic Study Companion...
✅ Agentic AI Agent is now active!
```

### STEP 4: Restart Frontend

**IMPORTANT: Open a NEW PowerShell window** (so .env changes are picked up)

```powershell
cd C:\Users\alios\OneDrive\Plocha\Lovable\smart-study-buddy-22
npm run dev
```

**Wait for:**
```
VITE v... ready in ...ms
Local: http://localhost:8080/
```

### STEP 5: Clear Browser & Sign Up

1. Open Chrome/Edge in **Incognito/Private mode** (to avoid cache issues)
2. Go to: http://localhost:8080
3. You'll be redirected to `/auth`

**If you see a Sign In page:**
- Click **"Sign Up"** tab
- Email: `doe839319@gmail.com`
- Password: (create a new password)
- Click **Sign Up**

**If you already have an account:**
- Try to sign in
- If it fails, you need to sign up again (your old account was in the old database)

### STEP 6: Verify It Works

After logging in:

1. **Dashboard should show 44 assignments** (not 5!)
2. **Check email** for assignment notifications
3. **Click an email link** - should open assignment detail page
4. **Upload materials** - should see the upload form

---

## TROUBLESHOOTING

### Still only see 5 assignments?

**Check which database the frontend is using:**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `localStorage.getItem('supabase.auth.token')`
4. If you see data, type: `localStorage.clear()` and refresh

**OR** just use Incognito mode (easiest)

### "Failed to load assignment" error?

This means you're not logged in to the correct database. Try:

1. Sign out
2. Close all browser windows
3. Open in Incognito
4. Go to http://localhost:8080
5. Sign up again with `doe839319@gmail.com`

### Email links still don't work?

1. Make sure you signed up in the CORRECT database (lcpexhkqaqftaqdtgebp)
2. Make sure frontend shows 44 assignments (not 5)
3. Clear browser cache completely

### Backend says "User not found"?

You need to sign up at http://localhost:8080/auth first. The backend needs your profile to exist in Supabase.

---

## VERIFY BOTH .ENV FILES ARE CORRECT

### Frontend `.env` should have:
```
VITE_SUPABASE_URL="https://lcpexhkqaqftaqdtgebp.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY"
```

### Backend `backend/.env` should have:
```
SUPABASE_URL=https://lcpexhkqaqftaqdtgebp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcGV4aGtxYXFmdGFxZHRnZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTcwNDIsImV4cCI6MjA3ODE5MzA0Mn0.z6pY_kCftjr1hT6zW7qCVEYHc4D0X8HLAuk_6N2IbcY
```

**Both should use `lcpexhkqaqftaqdtgebp` - I've already fixed both files for you.**

---

## QUICK TEST

After restarting everything:

```powershell
# Test backend is running
curl http://localhost:5001/health

# Should return: {"service":"Study Companion Calendar API","status":"ok"}
```

Then test frontend:
1. Open http://localhost:8080 in Incognito
2. Sign up
3. Should see 44 assignments

**If you see 44 assignments → ✅ EVERYTHING WORKS!**
