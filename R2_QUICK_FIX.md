# 🚨 Quick Fix: R2 Save Button Not Working

## The Problem

You added a **Cloudflare API Bearer token** but R2 needs **S3-compatible credentials**.

### What You Had (Wrong):
```bash
R2_Worker_API_KEY_URL='curl ... -H "Authorization: Bearer rFRhOvB7l6QYFdwDrBbSV_uzxyANLtgY-g86MNMR"'
```
❌ This is for Cloudflare REST API, not R2 storage

### What You Need (Correct):
```bash
VITE_R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8
VITE_R2_SECRET_ACCESS_KEY=ABC123XYZ...
```
✅ These are S3-compatible credentials for R2

---

## Quick Steps to Fix

### 1. Get R2 API Token

Visit: https://dash.cloudflare.com → **R2** → **Manage R2 API Tokens**

Click **"Create API Token"**:
- Name: `gameforge-upload`
- Permissions: **"Object Read & Write"**
- Bucket: `vybe-images`

You'll get:
```
Access Key ID: abc123...
Secret Access Key: XYZ789...
```

### 2. Update .env.local

Replace the placeholders in `.env.local`:

```bash
# From this:
VITE_R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_FROM_STEP_2
VITE_R2_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_FROM_STEP_2

# To this (with your actual values):
VITE_R2_ACCESS_KEY_ID=abc123def456ghi789
VITE_R2_SECRET_ACCESS_KEY=XYZ789ABC123DEF456longsecretkey
```

### 3. Restart Dev Server

```bash
rm -rf node_modules/.cache
npm run dev
```

### 4. Test

1. Generate 1-2 images in GameForge
2. Click the **Save button** (orange, top-right with share icon)
3. Should see upload overlay and success message

---

## Why Nothing Happened Before

When you clicked save with missing credentials, the code should have shown an alert. If you didn't see it:

1. **Check browser console** (F12) - there might be an error
2. **Make sure dev server is running** - check terminal
3. **Hard refresh** - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Visual Guide: Where to Find R2 API Tokens

### In Cloudflare Dashboard:

```
Cloudflare Homepage
  └─ R2 (left sidebar)
      └─ Overview
          └─ "Manage R2 API Tokens" (button on right)
              └─ "Create API Token" (blue button)
                  └─ Fill form:
                      • Name: gameforge-upload
                      • Permissions: Object Read & Write ✓
                      • Specific bucket: vybe-images ✓
                  └─ Click "Create API Token"
                  └─ COPY BOTH VALUES IMMEDIATELY!
                      • Access Key ID
                      • Secret Access Key
```

---

## Example (With Fake Credentials)

Here's what your `.env.local` should look like with real credentials:

```bash
# ============================================================================
# Cloudflare R2 Storage (REQUIRED for saving generated images)
# ============================================================================
VITE_R2_ACCOUNT_ID=ba309d82f63d4e140c8834aba2969f96
VITE_R2_ACCESS_KEY_ID=f41c7b8a2e9d3f6a1b5c8d2e7f9a3b6c
VITE_R2_SECRET_ACCESS_KEY=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6
VITE_R2_BUCKET_NAME=vybe-images
VITE_R2_PUBLIC_URL=https://pub-be25d8676c914843bf4db50712874cc0.r2.dev
```

**Note:** These are fake example values. Use your real credentials from Cloudflare.

---

## Troubleshooting

### "I see an alert: R2 credentials not configured"

✅ **Good!** This means the button is working. Just add the credentials and restart.

### "I don't see any alert or error"

Try:
1. Open browser console (F12)
2. Click save button again
3. Look for any errors or logs
4. Make sure you're clicking the **orange share icon** button (top-right)

### "I created the token but lost the Secret Access Key"

1. Go back to **Manage R2 API Tokens**
2. **Delete** the old token
3. **Create a new one** with a different name
4. Copy credentials immediately this time

### "403 Forbidden error when uploading"

- Token permissions might be wrong
- Recreate token with **"Object Read & Write"** permissions
- Make sure it's applied to `vybe-images` bucket

---

## What Happens After Adding Credentials

1. **Click save button**
2. **See upload overlay** - blue screen with progress
3. **Wait 5-30 seconds** depending on number of images
4. **Success popup** - "✅ Success! Uploaded X images to Cloudflare R2!"
5. **Check console** - see all image URLs
6. **Verify in Cloudflare** - R2 → vybe-images → Objects

---

## Quick Test Command

After updating `.env.local`, check if variables are set:

```bash
cat .env.local | grep VITE_R2
```

Should show:
```
VITE_R2_ACCOUNT_ID=ba309d82f63d4e140c8834aba2969f96
VITE_R2_ACCESS_KEY_ID=your_actual_key_here
VITE_R2_SECRET_ACCESS_KEY=your_actual_secret_here
VITE_R2_BUCKET_NAME=vybe-images
VITE_R2_PUBLIC_URL=https://pub-be25d8676c914843bf4db50712874cc0.r2.dev
```

---

**Once you have the credentials, replace the placeholders in .env.local, restart, and try again!** 🚀
