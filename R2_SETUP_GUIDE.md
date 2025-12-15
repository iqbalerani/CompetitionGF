# 🗄️ Cloudflare R2 Setup Guide

**Save Your Generated Images to Cloud Storage**

This guide shows you how to get Cloudflare R2 API credentials and configure GameForge to save generated images to your R2 bucket.

---

## What You Have Now ✅

Based on your Cloudflare dashboard screenshots:

- ✅ R2 bucket created: `vybe-images`
- ✅ Public Access: Enabled
- ✅ Account ID: `ba309d82f63d4e140c8834aba2969f96`
- ✅ Public URL: `https://pub-be25d8676c914843bf4db50712874cc0.r2.dev`

## What You Need ⚠️

To upload images, you need **R2 API Tokens**:
- ❌ Access Key ID
- ❌ Secret Access Key

---

## Step-by-Step: Get R2 API Tokens

### 1. Go to R2 API Tokens Page

1. Visit: https://dash.cloudflare.com
2. Navigate to: **R2 Object Storage** → **Manage R2 API Tokens**
3. Or direct link: https://dash.cloudflare.com/?to=/:account/r2/api-tokens

### 2. Create New API Token

1. Click **"Create API Token"** button
2. Fill in the form:
   - **Token Name:** `gameforge-upload` (or any name you like)
   - **Permissions:** Select **"Object Read & Write"**
   - **TTL (Time To Live):** Leave as default or set expiration
   - **Specify bucket (optional):** Select `vybe-images` bucket
3. Click **"Create API Token"**

### 3. Copy Your Credentials

After clicking create, you'll see:

```
Access Key ID: 1234567890abcdef1234567890abcdef
Secret Access Key: abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

**⚠️ IMPORTANT:** The Secret Access Key is **only shown once**! Copy it immediately.

If you missed it:
- You'll need to delete the token and create a new one
- Or generate a new token with different name

---

## Step 4: Add Credentials to .env.local

Open `/GameForge/.env.local` and update these lines:

```bash
# Replace with your actual R2 credentials
VITE_R2_ACCOUNT_ID=ba309d82f63d4e140c8834aba2969f96  # ✅ Already filled
VITE_R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_FROM_STEP_3
VITE_R2_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_FROM_STEP_3
VITE_R2_BUCKET_NAME=vybe-images  # ✅ Already filled
VITE_R2_PUBLIC_URL=https://pub-be25d8676c914843bf4db50712874cc0.r2.dev  # ✅ Already filled
```

**Example (with fake credentials):**
```bash
VITE_R2_ACCOUNT_ID=ba309d82f63d4e140c8834aba2969f96
VITE_R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
VITE_R2_SECRET_ACCESS_KEY=ABCDEFGHIJKLMNOP1234567890abcdefghijklmnop
VITE_R2_BUCKET_NAME=vybe-images
VITE_R2_PUBLIC_URL=https://pub-be25d8676c914843bf4db50712874cc0.r2.dev
```

---

## Step 5: Restart Development Server

```bash
# Stop current server (Ctrl+C in terminal)
# Then run:
rm -rf node_modules/.cache
npm run dev
```

**Why?** Vite caches environment variables, so we need a fresh restart.

---

## Step 6: Test the Save Feature

1. **Generate some images** in GameForge
   - Create a blueprint
   - Generate 2-3 assets

2. **Click the Share button** (orange button with Share icon)
   - Should see upload overlay
   - Progress bar shows upload status
   - Success message when complete

3. **Check browser console** (F12)
   - Should see uploaded image URLs
   - Should see project metadata URL

4. **Verify in Cloudflare Dashboard**
   - Go to R2 → `vybe-images` bucket
   - Click "Objects" tab
   - Should see your uploaded images!

---

## Troubleshooting

### Error: "R2 credentials not configured"

**Problem:** You clicked save but didn't add credentials yet.

**Fix:**
1. Follow Step 3 above to get credentials
2. Add them to `.env.local`
3. Restart dev server

### Error: "403 Forbidden" or "Access Denied"

**Problem:** API token doesn't have correct permissions.

**Fix:**
1. Go back to Cloudflare → R2 → Manage R2 API Tokens
2. Check your token has **"Object Read & Write"** permissions
3. Or delete the old token and create a new one with correct permissions

### Error: "Invalid Access Key ID"

**Problem:** You copied the credentials incorrectly.

**Fix:**
1. Double-check no extra spaces before/after the keys in `.env.local`
2. Make sure you're using the **Access Key ID** (not Account ID)
3. Try regenerating the token

### Images Upload But Can't See Them

**Problem:** Public access might not be configured correctly.

**Fix:**
1. Go to Cloudflare → R2 → `vybe-images`
2. Click "Settings" tab
3. Check **"Public Access"** is "Enabled"
4. Verify **"Public Development URL"** is set

### Public URLs Don't Work

**Problem:** Bucket public URL might be disabled.

**Fix:**
1. In R2 bucket settings, find "Public Development URL"
2. If disabled, click "Enable"
3. Copy the new public URL
4. Update `VITE_R2_PUBLIC_URL` in `.env.local`
5. Restart dev server

---

## What Happens When You Click Save?

1. **Collects all generated images** from your game nodes
2. **Converts base64 images** to proper image files
3. **Uploads to R2 bucket** with unique filenames:
   - Format: `gameforge-{timestamp}-{nodetype}-{nodeid}.png`
   - Example: `gameforge-1702345678901-protagonist-3.png`
4. **Saves project metadata** as JSON file with all image URLs
5. **Returns public URLs** you can share or use elsewhere

---

## Example: What You'll Get

After successful upload, check browser console for output like:

```
🎉 SUCCESS! All images uploaded to R2!

📸 Image URLs:
  1. https://pub-be25d8676c914843bf4db50712874cc0.r2.dev/gameforge-1702345678901-world-1.png
  2. https://pub-be25d8676c914843bf4db50712874cc0.r2.dev/gameforge-1702345678902-protagonist-3.png
  3. https://pub-be25d8676c914843bf4db50712874cc0.r2.dev/gameforge-1702345678903-zone-2.png

📄 Project Metadata: https://pub-be25d8676c914843bf4db50712874cc0.r2.dev/gameforge-project-the-forgotten-kingdom-1702345678900.json
```

**These URLs are permanent and publicly accessible!** You can:
- Share them directly
- Use in presentations
- Import into game engines
- Download anytime

---

## Security Notes ⚠️

### Client-Side API Keys (Current Setup)

Your R2 credentials are currently **exposed in the browser** because they use `VITE_` prefix.

**Is this safe?**
- ✅ **For development/demos:** Yes
- ✅ **For personal projects:** Acceptable
- ⏱️ **Temporary use:** Fine (just don't share your .env.local)
- ❌ **For production:** No!

**Why?**
- Anyone with browser dev tools can extract your keys
- Someone could upload files to your bucket
- Could rack up storage charges

### Production-Ready Setup (Future)

For production deployment:

1. **Create backend API proxy**
   ```
   Frontend → Your Backend → R2 (server-side keys)
   ```

2. **Remove VITE_ prefix** from R2 credentials in production

3. **Use serverless functions:**
   - Vercel Edge Functions
   - Cloudflare Workers
   - Next.js API routes

4. **Add authentication** to your upload endpoint

**Example (Next.js API Route):**
```typescript
// pages/api/upload-to-r2.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  // Credentials on server only (no VITE_ prefix)
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  // Handle upload...
  res.json({ success: true });
}
```

---

## Cost Estimates

Cloudflare R2 Pricing (as of 2025):

| Feature | Free Tier | Paid |
|---------|-----------|------|
| Storage | 10 GB | $0.015/GB/month |
| Class A Operations (writes) | 1M/month | $4.50/million |
| Class B Operations (reads) | 10M/month | $0.36/million |

**For GameForge Usage:**
- Average image: ~500 KB
- 100 images = ~50 MB
- Well within free tier!

**Estimated monthly cost for typical use:**
- 1,000 images (500 MB): **$0** (within free tier)
- 100,000 images (50 GB): ~$0.60/month storage + ~$0.45 operations = **~$1/month**

Very affordable! 💰

---

## Quick Command Reference

```bash
# Check if credentials are set
cat .env.local | grep VITE_R2

# Clear Vite cache (if env changes not applying)
rm -rf node_modules/.cache

# Restart dev server
npm run dev

# Check Cloudflare CLI (optional)
npx wrangler r2 bucket list

# View your R2 objects via CLI (optional)
npx wrangler r2 object list vybe-images
```

---

## Next Steps

Once R2 is working:

1. **Generate a full game** with Blueprint Wizard
2. **Generate 10-20 assets**
3. **Click Save** to upload everything to R2
4. **Get shareable URLs** for your portfolio/demo
5. **Submit to Bria hackathon** with hosted assets!

---

## Need Help?

- **R2 Docs:** https://developers.cloudflare.com/r2/
- **API Tokens Guide:** https://developers.cloudflare.com/r2/api/s3/tokens/
- **GameForge Issues:** Check TESTING_REPORT.md

---

**You're all set! 🚀 Now generate some amazing game assets and save them to the cloud!**
