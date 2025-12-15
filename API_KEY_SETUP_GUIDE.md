# 🔑 Fal.ai API Key Setup Guide

**Quick Fix for 401 Unauthorized Error**

---

## Current Issue

You're getting this error:
```
POST https://queue.fal.run/bria/fibo/generate 401 (Unauthorized)
❌ FIBO Generation Error: ApiError
```

**This means:** Your Fal.ai API key is invalid or missing.

---

## Step-by-Step Fix

### Step 1: Get Your Fal.ai API Key

1. **Go to Fal.ai Dashboard**
   - Visit: https://fal.ai/dashboard
   - Click **"Sign in with GitHub"**

2. **Find API Keys Section**
   - Look for one of these menu items:
     - "API Keys"
     - "Settings"
     - "Credentials"
     - "Developer"
   - It's usually in the top navigation or left sidebar

3. **Generate New API Key**
   - Click **"Create New Key"** or **"Generate API Key"**
   - Give it a name (e.g., "GameForge Development")
   - **Copy the key immediately** - it may only be shown once!

4. **Key Format Examples**
   - Could look like: `fal_abc123xyz456def789...` (single key)
   - Or: `12345678:abcdef123456secret...` (key ID:secret)
   - **Copy exactly as shown** - don't modify it

---

### Step 2: Update Your .env.local File

1. **Open .env.local in your project**
   ```bash
   cd /Users/iqbalerani/Documents/GameForgeApp/GameForge
   nano .env.local
   # Or open in your text editor
   ```

2. **Replace the VITE_BRIA_API_KEY line**
   ```bash
   # CURRENT (invalid key):
   VITE_BRIA_API_KEY=2b0b149b12be4ae2996589a7be06063e

   # REPLACE WITH (your actual key from Fal.ai):
   VITE_BRIA_API_KEY=your_actual_key_from_fal_dashboard
   ```

3. **Save the file**
   - Press `Ctrl+O`, `Enter`, then `Ctrl+X` (if using nano)
   - Or just save normally in your text editor

---

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then run:
rm -rf node_modules/.cache
npm run dev
```

**Why clear cache?** Vite caches environment variables, so we need to force a fresh reload.

---

### Step 4: Test FIBO Generation

1. **Open browser:** http://localhost:5173
2. **Select any node** in the graph (or create one)
3. **Click "Generate Asset"** button
4. **Check browser console** (F12 → Console tab)

**Expected Success Messages:**
```
🎨 FIBO Generation Request: {...}
✅ FIBO Generation Success
```

**If you still see 401:**
- Double-check the API key has no extra spaces
- Verify you copied the entire key
- Try regenerating a new key from Fal.ai dashboard

---

## Common Problems & Solutions

### Problem: "I don't see API Keys in the dashboard"

**Solution:**
- Make sure you're logged in
- Check if you need to verify your email
- Try different sections: Settings, Account, Developer Tools
- Contact Fal.ai support if still can't find it

### Problem: "My key starts with 'sk-or-' "

**Solution:**
- That's an **OpenRouter key**, not a Fal.ai key
- You need a separate key from https://fal.ai/dashboard
- GameForge uses **TWO** services:
  - Fal.ai (for images)
  - OpenRouter (for text)

### Problem: "I regenerated the key but still getting 401"

**Solution:**
```bash
# Make sure you:
1. Saved .env.local after pasting new key
2. Killed the dev server (Ctrl+C)
3. Cleared cache: rm -rf node_modules/.cache
4. Restarted: npm run dev
5. Hard-refreshed browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Problem: "Key works in Fal.ai Playground but not in GameForge"

**Solution:**
- Check if key is exposed correctly:
  ```bash
  # In your project root:
  cat .env.local | grep VITE_BRIA_API_KEY
  # Should print: VITE_BRIA_API_KEY=your_key_here
  ```
- Verify no typos in variable name (must be exactly `VITE_BRIA_API_KEY`)
- Make sure there's no `export` before the variable name

---

## Verification Checklist

- [ ] Logged into https://fal.ai/dashboard successfully
- [ ] Found API Keys section
- [ ] Generated/copied a valid API key
- [ ] Updated `.env.local` with new key
- [ ] Key has NO extra spaces or quotes around it
- [ ] Saved `.env.local` file
- [ ] Cleared node_modules/.cache
- [ ] Restarted dev server with `npm run dev`
- [ ] Hard-refreshed browser (Ctrl+Shift+R)
- [ ] Checked browser console for errors

---

## API Key Format Reference

According to the Fal.ai SDK documentation, keys can be in two formats:

### Format 1: Single Key (Most Common)
```bash
VITE_BRIA_API_KEY=fal_abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yz
```

### Format 2: Key ID + Secret
```bash
VITE_BRIA_API_KEY=12345678:abcdef123456secret789012
```

**Use whichever format Fal.ai gives you** - don't try to convert or modify it!

---

## Testing Your API Key Manually

If you want to verify your key works before testing in GameForge:

1. **Visit Fal.ai Playground**
   - https://fal.ai/models/bria/fibo/generate
   - Click "Try it out" or "Playground"

2. **Enter your API key** when prompted

3. **Test image generation** with a simple prompt like "a red apple"

4. **If it works in playground:**
   - Your key is valid
   - Problem is in GameForge configuration
   - Follow this guide carefully again

5. **If it fails in playground:**
   - Key is invalid/expired
   - Generate a new key from dashboard

---

## Still Having Issues?

### Check These Files:

1. **briaService.ts** (should already be correct after our fixes)
   ```typescript
   // Line 20-26 should look like:
   const apiKey = import.meta.env.VITE_BRIA_API_KEY;
   if (!apiKey) {
     console.warn("⚠️ VITE_BRIA_API_KEY not found...");
   }
   fal.config({
     credentials: apiKey || 'dummy-key'
   });
   ```

2. **.gitignore** (make sure .env.local is ignored)
   ```bash
   # Should contain this line:
   *.local
   ```

3. **.env.example** (reference only, don't modify)
   ```bash
   # This file has placeholder values
   # Your .env.local should have REAL keys
   ```

---

## Need Help?

- **Fal.ai Documentation:** https://docs.fal.ai/authentication
- **Fal.ai Dashboard:** https://fal.ai/dashboard
- **GameForge Issues:** Check TESTING_REPORT.md for more troubleshooting

---

## Quick Command Reference

```bash
# Check if .env.local exists
ls -la .env.local

# View your API key (⚠️ DO NOT share this output!)
cat .env.local | grep VITE_BRIA_API_KEY

# Clear Vite cache
rm -rf node_modules/.cache

# Restart dev server
npm run dev

# View browser console
# Press F12 in browser, click "Console" tab
```

---

**Once your API key is working, you should see:**
```
✅ FIBO Generation Success
```

**And your generated images will appear in the GameForge nodes!**

---

Good luck! 🚀
