# Deploy to Render (Backend + Frontend)

This guide walks you through deploying MoharCRM entirely on Render:
- **Backend:** Render Web Service (Node.js)
- **Frontend:** Render Static Site
- **Source:** GitHub (auto-deploy on git push)

Render offers a free tier and integrates seamlessly with GitHub.

---

## Why Render?

**Pros:**
- ✅ Simple, clean interface
- ✅ Free tier includes both static sites and web services
- ✅ Auto-deploy from GitHub
- ✅ Persistent storage (disks) for database
- ✅ Good documentation
- ✅ Good uptime/reliability
- ✅ All in one platform (no jumping between services)

**Cons:**
- Free tier has limited resources (shared CPU)
- Cold starts on free tier (~30 seconds first request)

**Cost:** Free tier or $7/month (Web Service) + $6/month (Static Site) = ~$13/month

---

## Prerequisites

Before starting, ensure you have:

1. ✅ GitHub account with MoharCRM repository pushed
2. ✅ Render account (free at https://render.com)
3. ✅ Render authorized to access your GitHub repo

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub account
5. Complete account setup

### Step 2: Create Backend Web Service

1. In Render dashboard, click **New** → **Web Service**
2. Select **Deploy an existing repository**
3. Search for and select **MoharCRM** repository
4. Click **Connect**

### Step 3: Configure Backend Service

In the service configuration page, set:

**Basic Settings:**
- **Name:** `moharcrm-backend` (or any name)
- **Environment:** `Node`
- **Region:** Choose closest to you (or default)
- **Branch:** `main` (or `master`)

**Build & Start:**
- **Build Command:** `cd crm-app/backend && npm install`
- **Start Command:** `cd crm-app/backend && npm start`

Or use a Procfile approach:
- **Root Directory:** `.` (leave blank)
- **Build Command:** `npm install --prefix crm-app/backend`
- **Start Command:** `npm start --prefix crm-app/backend`

**Instance Type:**
- Choose **Free** to start
- Upgrade to **Starter** ($7/month) for better performance

**Environment Variables:**
- Click **Add Environment Variable**
- Add:
  ```
  NODE_ENV = production
  PORT = 3000
  ```

### Step 4: Add Persistent Disk (CRITICAL for Database)

1. Scroll to **Disks** section
2. Click **Add Disk**
3. Configure:
   - **Path:** `/app/crm-app/backend`
   - **Size:** 1 GB (more than enough for SQLite)
4. This keeps your `crm.db` file across restarts

**Why this is critical:** Without persistent storage, your database resets every time the app restarts!

### Step 5: Deploy

1. Click **Create Web Service**
2. Render builds and deploys (~3-5 minutes)
3. Wait for "Your service is live" message

### Step 6: Get Backend URL

1. After deployment, find your backend URL at the top of the page
2. It will look like: `https://moharcrm-backend.onrender.com`
3. **Copy this URL** — you'll need it for the frontend

### Step 7: Test Backend

Open browser and test:
```
https://moharcrm-backend.onrender.com/api/students
```

Should return JSON (empty array if no data).

---

## Part 2: Deploy Frontend to Render (Static Site)

### Step 1: Create Static Site

1. In Render dashboard, click **New** → **Static Site**
2. Select **Deploy an existing repository**
3. Search for and select **MoharCRM** repository
4. Click **Connect**

### Step 2: Configure Frontend Service

In the service configuration page, set:

**Basic Settings:**
- **Name:** `moharcrm-frontend` (or any name)
- **Region:** Same as backend (for consistency)
- **Branch:** `main` (or `master`)

**Build Settings:**
- **Root Directory:** `crm-app/frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Step 3: Add Environment Variables

1. Scroll to **Environment** section
2. Click **Add Environment Variable**
3. Add:
   ```
   VITE_API_URL = https://moharcrm-backend.onrender.com/api
   ```

(Replace with your actual Render backend URL from Part 1, Step 6)

### Step 4: Deploy

1. Click **Create Static Site**
2. Render builds and deploys (~2-3 minutes)
3. Wait for deployment to complete

### Step 5: Get Frontend URL

Your frontend URL will be displayed at the top:
- `https://moharcrm-frontend.onrender.com`

---

## Part 3: Test Both Services

### Test Backend

Open in browser:
```
https://moharcrm-backend.onrender.com/api/students
```

Should return: `[]` (empty array)

### Test Frontend

1. Visit your frontend URL: `https://moharcrm-frontend.onrender.com`
2. Dashboard should load
3. Click **Students** tab
4. Should connect to backend and show empty list (or populated if data exists)
5. Try creating a student to verify it works end-to-end

---

## Part 4: Auto-Deploy (GitHub Integration)

Both services auto-deploy by default. Here's what happens:

```
You push to GitHub
    ↓
Render detects push
    ↓
Backend redeploys (~3-5 minutes)
Frontend redeploys (~2-3 minutes)
    ↓
Both live with latest code
```

### View Deployment Logs

**Backend logs:**
1. Dashboard → Your Web Service
2. Click **Logs** tab
3. See real-time deployment and runtime logs

**Frontend logs:**
1. Dashboard → Your Static Site
2. Click **Logs** tab
3. See build and deployment logs

---

## Configuration Files

The following files help with deployment:

**`render.yaml`** (Optional - for advanced setup)
- Specifies services and configurations
- Useful for managing multiple services
- Not required if you configure via UI

We've already created basic configuration files. You can enhance with `render.yaml` if needed.

---

## Architecture After Deployment

```
User Browser
    ↓
https://moharcrm-frontend.onrender.com (Frontend - React Static)
    ↓ (API calls to)
https://moharcrm-backend.onrender.com/api (Backend - Express Web Service)
    ↓
crm.db (SQLite in Render persistent disk storage)
```

---

## Database Persistence

### How it Works:

1. **Persistent Disk:** Created in Part 1, Step 4
2. **Database File:** `crm.db` stored on disk at `/app/crm-app/backend`
3. **Startup:** When backend starts, sql.js loads `crm.db` into memory
4. **Updates:** Changes written back to disk file
5. **Restart:** File survives service restarts ✅

### Backup Strategy

**Download Database Regularly:**

Using Render CLI:
```bash
# Install Render CLI
npm install -g @render-oss/render-cli

# Login
render login

# Download database
render download --service moharcrm-backend --path /app/crm-app/backend/crm.db

# Saves as crm.db in current directory
```

**Or manually:**
1. Use SSH into your Render instance (if available in plan)
2. Download `crm.db` file
3. Store in cloud (Google Drive, Dropbox, AWS S3)

**Backup Frequency:**
- Daily (for active CRM)
- Or at least weekly
- Keep 4 recent backups

---

## Monitoring & Maintenance

### View Backend Logs

1. Dashboard → Web Service
2. Click **Logs**
3. See real-time application logs
4. Check for errors or issues

### View Frontend Logs

1. Dashboard → Static Site
2. Click **Logs**
3. See build logs and any errors

### Check Health

**Backend health check:**
```bash
curl https://moharcrm-backend.onrender.com/api/stats
```

Should return JSON with student statistics.

### Set Up Email Alerts (Optional)

1. In Render dashboard → Account Settings
2. Enable email notifications for deployment failures
3. Get alerted if deployment or service goes down

---

## Troubleshooting

### Frontend shows "Cannot reach API"

**Problem:** API URL is incorrect or backend is down

**Solution:**
1. Verify VITE_API_URL in frontend environment variables
2. Make sure it includes `/api` at the end
3. Test backend URL directly in browser
4. Check backend logs for errors
5. Redeploy frontend with correct URL

### Backend deployment fails

**Problem:** Build error during deployment

**Solution:**
1. Check deployment logs in Render dashboard
2. Common issues:
   - Incorrect build command → verify it matches your structure
   - Missing dependencies → commit `package-lock.json` to git
   - Wrong Node version → add `NODE_VERSION=18` env var
3. Fix and push to GitHub to retry

### Data disappears on restart

**Problem:** Lost student data after service restart

**Solution:**
1. Check if persistent disk was configured (Part 1, Step 4)
2. If not configured:
   - Add disk to the service
   - Deploy again
   - Data from before disk addition is lost
3. Restore from backup if available

### Service is slow or timing out

**Problem:** Free tier has limited resources

**Solution:**
1. Upgrade Web Service from Free to Starter ($7/month)
2. Gets dedicated resources and faster performance
3. Cold starts reduced from ~30s to ~5s

### Static site showing 404 on page refresh

**Problem:** SPA routing issue

**Solution:**
This is a known issue with static hosting. Solutions:

**Option A (Recommended):** Serve frontend from backend
1. Build frontend: `npm run build` in `crm-app/frontend`
2. Update `crm-app/backend/server.js`:
   ```javascript
   const path = require('path');
   
   // Before app.listen()
   app.use(express.static(path.join(__dirname, '../frontend/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
   });
   ```
3. Deploy only backend as web service (no separate static site)
4. Frontend served from same domain as backend

**Option B:** Use Render Static Site with redirects (limited)
- Add `_redirects` file to frontend (requires Netlify-style routing)
- Render Static Site has limited SPA support

---

## Configuration Files for Render

### `render.yaml` (Optional)

Create in root directory if you want IaC-style configuration:

```yaml
services:
  - type: web
    name: moharcrm-backend
    env: node
    buildCommand: npm install --prefix crm-app/backend
    startCommand: npm start --prefix crm-app/backend
    rootDir: crm-app/backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    disk:
      name: database
      mountPath: /app/crm-app/backend
      sizeGb: 1

  - type: static_site
    name: moharcrm-frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    rootDir: crm-app/frontend
    envVars:
      - key: VITE_API_URL
        value: https://moharcrm-backend.onrender.com/api
```

---

## Costs

| Item | Cost | Notes |
|------|------|-------|
| **Backend (Web Service)** | Free or $7/month | Free has cold starts, Starter recommended |
| **Frontend (Static Site)** | Free | Included, no additional cost |
| **Database (1GB disk)** | Included | Part of web service |
| **Monthly Total** | Free-$7 | Static sites always free |

**Upgrade Recommendations:**
- Start on free tier
- If database grows >1GB, upgrade disk ($6/month per additional)
- If backend is slow, upgrade to Starter ($7/month)

---

## Deployment Checklist

Before going live:

- [ ] GitHub repository created and pushed
- [ ] Render account created and authorized with GitHub
- [ ] Backend Web Service created
- [ ] Backend persistent disk configured (CRITICAL!)
- [ ] Backend environment variables set
- [ ] Backend deployed and accessible
- [ ] Backend URL copied
- [ ] Frontend Static Site created
- [ ] Frontend build command set correctly
- [ ] Frontend VITE_API_URL environment variable set with backend URL
- [ ] Frontend deployed and accessible
- [ ] Frontend can reach backend API (test creating student)
- [ ] Database backup procedure documented
- [ ] Team has Render dashboard access
- [ ] Email notifications enabled for failures

---

## Deployment Timeline

| Step | Time |
|------|------|
| Create accounts | 5 min |
| Deploy backend | 5 min |
| Add persistent disk | 2 min |
| Deploy frontend | 5 min |
| Test both services | 5 min |
| Document & backup | 10 min |
| **Total** | **~30 minutes** |

---

## Next Steps (After Deployment)

### Immediate (Today)
1. ✅ Deploy to Render
2. ✅ Test all CRUD operations (create/read/update/delete students)
3. ✅ Verify data persists after service restart
4. ✅ Check logs for errors

### This Week
1. Download and test database backup procedure
2. Share dashboard with team
3. Document team's access procedures
4. Monitor logs for any issues

### This Month
1. Import real student data
2. Train team on CRM features
3. Set up regular backup schedule
4. Consider upgrade to Starter tier if needed

### Ongoing
1. Weekly database backups
2. Monitor service health
3. Watch error logs
4. Optimize as needed

---

## Advanced: Serve Frontend from Backend

If you prefer everything on one domain:

**Steps:**
1. Build frontend locally: `cd crm-app/frontend && npm run build`
2. Verify `dist/` folder created
3. Update `server.js` to serve static files (see Troubleshooting above)
4. Push to GitHub
5. Render redeploys backend with frontend included
6. Delete the Static Site service from Render
7. Access both at: `https://moharcrm-backend.onrender.com`

**Benefits:**
- Single URL
- Easier debugging
- SPA routing works automatically
- One service to manage

---

## Render CLI Commands (Optional)

Install and use Render CLI for advanced operations:

```bash
# Install
npm install -g @render-oss/render-cli

# Login
render login

# List services
render services

# View logs
render logs --service moharcrm-backend

# Download files from persistent disk
render download --service moharcrm-backend --path /app/crm-app/backend/crm.db

# Upload files to persistent disk
render upload --service moharcrm-backend --path ./crm.db:/app/crm-app/backend/crm.db
```

---

## Useful Links

**Render Documentation:**
- https://render.com/docs
- https://render.com/docs/web-services
- https://render.com/docs/static-sites
- https://render.com/docs/disks

**GitHub Integration:**
- https://render.com/docs/github

**Environment Variables:**
- https://render.com/docs/configure-environment-variables

**Support:**
- https://render.com/support
- Community Discord available

---

## Quick Reference

| Item | URL |
|------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **Backend Service** | https://moharcrm-backend.onrender.com |
| **Frontend Service** | https://moharcrm-frontend.onrender.com |
| **Backend API** | https://moharcrm-backend.onrender.com/api |
| **Render Docs** | https://render.com/docs |

---

## Summary

You now have a complete deployment on Render:

✅ **Backend:** Web Service with persistent database  
✅ **Frontend:** Static Site  
✅ **Auto-deploy:** GitHub integration  
✅ **Free tier:** Available to start  
✅ **Persistent storage:** Database survives restarts  
✅ **Monitoring:** Logs and alerts included  

**Ready to deploy?** Start at https://render.com and follow Part 1!

---

**Last Updated:** May 2026  
**Status:** Production Ready  
**Platform:** Render  
**Version:** 1.0
