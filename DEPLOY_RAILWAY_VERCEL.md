# Deploy to Railway (Backend) + Vercel (Frontend)

This guide walks you through deploying MoharCRM with:
- **Backend:** Railway
- **Frontend:** Vercel  
- **Source:** GitHub (auto-deploy on git push)

Both platforms offer free tiers and integrate seamlessly with GitHub.

---

## Prerequisites

Before starting, ensure you have:

1. ✅ GitHub account with MoharCRM repository
2. ✅ Railway account (free at https://railway.app)
3. ✅ Vercel account (free at https://vercel.com)
4. ✅ Both authorized to access your GitHub repo

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Sign up"
3. Choose "Sign in with GitHub"
4. Authorize Railway to access your GitHub account
5. Complete setup wizard

### Step 2: Create Backend Project

1. In Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Search for and select **MoharCRM** repository
4. Railway will scan and find the Express backend
5. Click **Deploy** (wait 2-5 minutes)

### Step 3: Configure Backend Settings

In Railway dashboard for your backend project:

**1. Environment Variables:**
- Click **Variables**
- Add these variables:
  ```
  NODE_ENV = production
  PORT = 5000
  ```

**2. Persistent Storage (CRITICAL for Database)**
- Click **Storage** (or **Volumes**)
- Add new volume:
  - Mount path: `/app` (or `/app/crm-app/backend` depending on Railway's root)
  - This keeps `crm.db` file across restarts
  - **Without this, all data is lost on restart!**

**3. Build & Deploy Settings**
- Railway should auto-detect Express
- Build command: `npm install` (auto-detected)
- Start command: `npm start` (auto-detected)
- If not auto-detected, set manually in project settings

### Step 4: Get Backend URL

After deployment completes:

1. In Railway dashboard, go to **Deployments**
2. Look for **Service URL** (e.g., `https://moharcrm-backend.up.railway.app`)
3. **Copy this URL** — you'll need it for Vercel config
4. Test it works: Visit `https://moharcrm-backend.up.railway.app/api/students`
   - Should return JSON (empty array if no data)

### Step 5: Enable Auto-Deploy

Railway auto-deploys by default:
- Any push to your GitHub repo triggers a new deploy
- Wait ~2-5 minutes for deployment to complete
- Check Deployments tab to see build logs

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Agree to terms and complete setup

### Step 2: Import Project

1. In Vercel dashboard, click **Add New** → **Project**
2. Select **Import Git Repository**
3. Find and select **MoharCRM** repository
4. Click **Import**

### Step 3: Configure Frontend Settings

In Vercel import dialog:

**1. Framework Preset:**
- Vercel should auto-detect **Vite**
- If not, manually select **Vite**

**2. Root Directory:**
- Select **`crm-app/frontend`** from dropdown
- This tells Vercel where the frontend code is

**3. Build Command:**
- Auto-detected: `npm run build` ✅
- If different, change to: `npm run build`

**4. Output Directory:**
- Auto-detected: `dist` ✅
- Keep as is

**5. Environment Variables:**
- You'll add these in the next step
- Click **Add Environment Variable**

### Step 4: Add Environment Variables

Before deployment, add the backend API URL:

**In Vercel environment variables:**

```
Variable Name: VITE_API_URL
Value: https://moharcrm-backend.up.railway.app/api
```

(Replace with your actual Railway backend URL from Part 1, Step 4)

**For different environments** (optional):
- Production (main branch): `https://moharcrm-backend.up.railway.app/api`
- Preview (PR branches): Can be different or same

### Step 5: Deploy Frontend

1. Click **Deploy** button
2. Vercel builds and deploys frontend
3. Wait ~2-3 minutes for build to complete
4. You'll get a Vercel URL (e.g., `https://moharcrm.vercel.app`)

### Step 6: Test Deployment

1. Visit your Vercel URL: `https://moharcrm.vercel.app`
2. The app should load and show the dashboard
3. Click "Students" → should load students from Railway backend
4. Test creating/editing a student

---

## Part 3: Enable Auto-Deploy (GitHub → Railway & Vercel)

Both platforms auto-deploy by default once connected to GitHub.

### What happens on git push:

```
You push to GitHub
    ↓
Railway detects push → builds backend → deploys
    ↓
Vercel detects push → builds frontend → deploys
    ↓
Both live in ~3-5 minutes
```

### Manual Redeploy (if needed):

**Railway:**
1. Go to Deployments
2. Click "Redeploy"

**Vercel:**
1. Go to Deployments
2. Click the 3-dots on latest deployment → "Redeploy"

---

## Configuration Files (Already Created)

The following files have been created to help deployment:

**`vercel.json`** — Vercel configuration
- Specifies frontend root directory
- Build and output directories
- Environment variable mappings

**`railway.json`** — Railway configuration  
- Specifies backend root directory
- Build and start commands
- Environment variables

These files are optional but recommended for consistency.

---

## Architecture After Deployment

```
User Browser
    ↓
https://moharcrm.vercel.app (Frontend - React)
    ↓ (API calls to)
https://moharcrm-backend.up.railway.app/api (Backend - Express)
    ↓
crm.db (SQLite database in Railway persistent storage)
```

---

## Database Persistence (IMPORTANT!)

### Without Persistent Storage:
- Data loads into memory when backend starts
- When Railway restarts your app, memory is cleared
- **All student data disappears** ❌

### With Persistent Storage (Configured in Part 1, Step 3):
- `crm.db` file stored on Railway's disk
- Loaded into memory when app starts
- Survives restarts ✅
- Data persists indefinitely

### Backup Strategy:

**Weekly Backup:**
1. SSH into Railway instance (or use Railway CLI)
2. Download `crm.db`
3. Store locally or in cloud (Google Drive, AWS S3)

**Using Railway CLI:**
```bash
railway down crm.db
# Downloads database file to current directory
```

---

## Monitoring & Maintenance

### View Backend Logs (Railway):

1. Dashboard → Deployments
2. Click latest deployment
3. View real-time logs
4. Check for errors

### View Frontend Logs (Vercel):

1. Dashboard → Deployments
2. Click latest deployment
3. View build logs and runtime logs
4. Check for 404 errors or API failures

### Check API Health:

From browser console or curl:
```bash
curl https://moharcrm-backend.up.railway.app/api/stats
```

Should return JSON with student statistics.

---

## Troubleshooting

### Frontend shows "Cannot reach API"

**Problem:** Frontend can't connect to backend

**Solution:**
1. Check VITE_API_URL environment variable in Vercel
2. Verify Railway backend is running (check Deployments)
3. Test backend URL directly: `https://moharcrm-backend.up.railway.app/api/students`
4. Redeploy frontend after fixing URL

### Backend deployment fails

**Problem:** Build error during deployment

**Solution:**
1. Check Railway Deployments logs
2. Common issues:
   - Missing dependencies → run `npm install` locally, commit `package-lock.json`
   - Wrong Node version → set in Railway Variables: `NODE_VERSION=18` or `20`
   - Port conflict → verify `PORT=5000` in environment variables

### Data disappears after restart

**Problem:** Lost student data after Railway restart

**Solution:**
1. Persistent storage not configured (Part 1, Step 3)
2. Add storage volume to Railway project
3. Restore from backup if available

### Vercel shows 404 on subpages

**Problem:** Refreshing page gives 404

**Solution:**
1. This is a SPA routing issue
2. Add `vercel.json` rewrites to serve index.html (already created)
3. If not working, ensure `vercel.json` is in root directory
4. Redeploy

---

## Costs

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| **Railway** | $5/month credit | $10-50/month | Sufficient for small CRM |
| **Vercel** | Unlimited | $20/month (Pro) | Free tier enough for frontend |
| **GitHub** | Free | $4-231/month | Free for public repos |
| **Total** | ~$5/month | ~$15-25/month | Very affordable |

---

## Deployment Checklist

Before pushing to production:

- [ ] Railway backend project created
- [ ] Persistent storage configured in Railway (CRITICAL!)
- [ ] Backend environment variables set (NODE_ENV, PORT)
- [ ] Backend deployed and accessible via URL
- [ ] Vercel frontend project created  
- [ ] Frontend root directory set to `crm-app/frontend`
- [ ] VITE_API_URL environment variable set in Vercel
- [ ] Frontend deployed and accessible
- [ ] Frontend can call backend API (test create/read student)
- [ ] Database backups strategy documented
- [ ] Team has access to both dashboards
- [ ] Monitoring logs set up for first 24 hours

---

## Next Steps

1. **Test Thoroughly** (24 hours)
   - Create test students
   - Edit and delete students
   - Test all CRUD operations
   - Check logs for errors

2. **Monitor Performance**
   - Check deployment frequency
   - Monitor error rates
   - Track database file size growth

3. **Backup Strategy** (This Week)
   - Set up weekly database backups
   - Document backup location
   - Test restore procedure

4. **Team Access**
   - Share Railway dashboard with team
   - Share Vercel dashboard with team
   - Document deployment process

5. **Domain Setup** (Optional)
   - Connect custom domain to Vercel frontend
   - Get Railway backend URL configured
   - Set up SSL/TLS (automatic on both platforms)

---

## Quick Reference

**Backend Status:** `https://your-railway-url.up.railway.app/api/stats`

**Frontend URL:** `https://your-vercel-url.vercel.app`

**Admin Dashboard (Railway):** https://railway.app

**Admin Dashboard (Vercel):** https://vercel.com/dashboard

---

## Support

**Railway Support:** https://docs.railway.app
- Comprehensive documentation
- Community Discord

**Vercel Support:** https://vercel.com/docs
- Comprehensive documentation
- Community Discord

**MoharCRM Docs:**
- DEPLOYMENT_GUIDE.md — General deployment info
- CLAUDE.md — Technical architecture
- CRM_CONFIGURATION_GUIDE.md — Business setup

---

**Last Updated:** May 2026  
**Status:** Ready for Production  
**Version:** 1.0
