# 🚨 Quick Fix - Two Issues

## Issue 1: User Not Found ❌
**Error**: `❌ User not found: doe839319@gmail.com`

**Problem**: You need to **log in to the app first** to create your profile!

**Fix**:
1. **Open**: http://localhost:8080/auth
2. **Sign up** (or log in) with: `doe839319@gmail.com`
3. **Create a password** (any password is fine)
4. **Once logged in**, your profile is created automatically
5. **Restart backend** - assignments will sync!

---

## Issue 2: Email Password Not Working ❌
**Error**: `(535, b'5.7.8 Username and Password not accepted')`

**Problem**: The `.env` file might not exist or password is wrong.

**Fix**:

### Step 1: Create `backend/.env` file

Create a file called `.env` in the `backend/` folder with this content:

```env
# ============================================
# AGENTIC AI STUDY COMPANION - CONFIGURATION
# ============================================

USER_EMAIL=doe839319@gmail.com
SENDER_EMAIL=doe839319@gmail.com
SENDER_PASSWORD=qcokkdvzyhskelwo

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

MONGODB_CONNECTION_STRING=mongodb+srv://prosus-db-user:yLFIMGwT48qUKxDG@prosus-db-user.wfei3mu.mongodb.net/?retryWrites=true&w=majority

SUPABASE_URL=https://dpyvbkrfasiskdrqimhf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweXZia3JmYXNpc2tkcnFpbWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDEzNzUsImV4cCI6MjA3ODE3NzM3NX0.JGb_M_zbh2Lzrca8O_GY8UtCvMnZocsiUBEbpELsLV8
```

**Important**: 
- Password is: `qcokkdvzyhskelwo` (no spaces!)
- Make sure the file is named exactly `.env` (not `env.txt` or `.env.txt`)

### Step 2: Verify Password

The password you provided: `qcok kdvz yhsk elwo`
Without spaces: `qcokkdvzyhskelwo`

**If email still fails**:
1. Go to: https://myaccount.google.com/apppasswords
2. **Delete** the old app password
3. **Create a new one**
4. **Copy** the new 16-character code
5. **Update** `backend/.env` with the new password
6. **Restart backend**

---

## ✅ After Fixing Both Issues

1. **Log in to app**: http://localhost:8080/auth
2. **Restart backend**: `python backend/api.py`
3. **Check logs** - you should see:
   ```
   ✅ [AGENT] Synced 5 assignments to 'Your assignments' tab
   ✅ Created 5 study sessions for assignment
   📧 Sending exam reminder to doe839319@gmail.com...
   ✅ Email sent successfully
   ```

4. **Check dashboard**:
   - All 5 assignments should appear
   - Each should have study sessions
   - Check your email inbox!

---

## 🎯 Summary

**To Fix Everything**:
1. ✅ Create `backend/.env` with password: `qcokkdvzyhskelwo`
2. ✅ Log in to app at http://localhost:8080/auth
3. ✅ Restart backend
4. ✅ Check dashboard - assignments should appear!

**That's it!** 🚀

