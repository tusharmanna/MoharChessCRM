# MoharCRM Deployment Guide

This guide explains how to deploy the MoharCRM application to production.

---

## Overview

MoharCRM is a full-stack application that consists of:
- **Backend:** Node.js + Express API
- **Frontend:** React + Vite (static assets)
- **Database:** SQLite (crm.db file—stores data locally)

The application uses **sql.js**, which loads the entire database into memory. This means the database file must be persistent across deployments.

---

## Deployment Options

### Option 1: Railway (Recommended for Beginners) ⭐

Railway is the easiest option with automatic deployments from GitHub.

**Pros:**
- Simple GitHub integration
- Free tier available ($5/month credits)
- Auto-deploys on git push
- Easy environment variable management
- Good for small to medium projects

**Cons:**
- Less customizable than AWS
- Limited to Railway's infrastructure

**Cost:** Free tier + $5/month credit (sufficient for most small teams)

---

### Option 2: Heroku (Budget Alternative)

Heroku was historically popular but is now paid-only.

**Cost:** $7/month (basic dyno)

**Setup:** Similar to Railway but deprecated free tier

---

### Option 3: AWS (Enterprise/Scale)

For larger deployments with auto-scaling needs.

**Cost:** Variable, typically $10-50+/month

**Complexity:** Higher—requires more configuration

---

### Option 4: DigitalOcean (Balanced)

Good middle ground between simplicity and control.

**Cost:** $4-6/month (basic droplet)

**Complexity:** Moderate—requires SSH/server management

---

### Option 5: Render (Railway Alternative)

Similar to Railway with good free tier.

**Cost:** Free tier available, paid plans start at $7/month

---

## Quick Start: Railway Deployment

### Prerequisites
1. GitHub account with MoharCRM repository
2. Railway account (free at https://railway.app)
3. Basic understanding of environment variables

### Step 1: Connect GitHub to Railway

1. Go to https://railway.app
2. Sign up or log in
3. Click **New Project** → **Deploy from GitHub repo**
4. Authorize Railway to access your GitHub account
5. Select the **MoharCRM** repository
6. Railway will auto-detect it's a Node.js project

### Step 2: Configure Environment Variables

In Railway dashboard, go to **Variables**:

```
NODE_ENV=production
```

No other backend variables needed (uses defaults).

### Step 3: Deploy Backend

Railway auto-detects the Express server:
1. Railway builds and deploys automatically
2. You'll get a backend URL like: `https://moharcrm-backend.up.railway.app`

### Step 4: Deploy Frontend

The frontend is static assets (React built with Vite).

**Option A: Separate Railway Project**
1. Create a new Railway project for frontend
2. Add build configuration:
   - Build command: `cd crm-app/frontend && npm run build`
   - Start command: `npx serve -s dist` (installs `serve` package)
   - Env: `VITE_API_URL=https://moharcrm-backend.up.railway.app/api`

**Option B: Serve from Backend (Simpler)**
1. Build frontend: `npm run build` → creates `dist/` folder
2. Update backend to serve static files:
   ```javascript
   // In server.js, before app.listen()
   app.use(express.static('../frontend/dist'));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
   });
   ```
3. Deploy entire project as single Railway project

### Step 5: Set Frontend API URL

In Railway Variables for backend project:
```
VITE_API_URL=https://moharcrm-backend.up.railway.app/api
```

Or if serving from backend, this is already set during build.

### Step 6: Test Deployment

1. Visit your Railway backend URL
2. Test API: `https://moharcrm-backend.up.railway.app/api/students`
3. If serving frontend from backend: Visit the base URL
4. If separate frontend: Visit frontend URL

### Step 7: Auto-Deploy on GitHub Push

Railway automatically redeploys when you push to GitHub (default behavior—no extra setup needed).

---

## Important: Database Persistence

### Critical Issue with sql.js

sql.js loads the **entire database into memory** from the `crm.db` file. This means:

**Problem:** If the application restarts, changes are lost unless the file is saved.

**Solution for Railway:** Use Persistent Storage

1. In Railway dashboard → Variables
2. Add **persistent volume**:
   - Mount path: `/app/crm-app/backend` (or adjust to your path)
   - This keeps the `crm.db` file across restarts

**Backup Strategy:**
- Download `crm.db` regularly from your server
- Store backups in GitHub (don't commit the DB file itself, but keep backups)
- Or upload to cloud storage (AWS S3, Google Drive)

---

## Detailed Railway Setup

### Full Step-by-Step

**1. Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub
- Create free account

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose MoharCRM repository

**3. Configure Service**

Railway will auto-detect Express. Configure:

```
Service Name: moharcrm-backend (or any name)
Root Directory: crm-app/backend
Build Command: npm install
Start Command: npm start
Port: 5000
```

**4. Add Environment Variables**
```
NODE_ENV=production
PORT=5000
```

**5. Deploy**
- Click "Deploy"
- Wait 2-5 minutes for build and deployment

**6. Get URL**
- Dashboard shows: `Service URL: https://moharcrm-backend.up.railway.app`
- This is your backend API base URL

**7. Deploy Frontend (Option B - Recommended)**

Modify `server.js` to serve static files:

```javascript
// Add at the top
const path = require('path');

// Before app.listen(), add:
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

Then:
- Push updated code to GitHub
- Railway auto-redeploys
- Frontend now served from same URL as backend

---

## Environment Variables by Platform

### Railway

Set in Railway dashboard (Variables section):

```env
NODE_ENV=production
PORT=5000
```

### DigitalOcean / Self-Hosted

Create `.env` file in `crm-app/backend/`:

```env
NODE_ENV=production
PORT=5000
```

### AWS EC2 / Heroku

Environment variables depend on platform:
- **Heroku:** Use `heroku config:set VAR=value`
- **AWS:** Use Systems Manager Parameter Store or .env file
- **DigitalOcean:** Add to shell profile or `.env` file

---

## Database Backup Strategy

### Manual Backup (Weekly)

1. SSH into your server or access Railway storage
2. Download `crm-app/backend/crm.db`
3. Store in cloud (Google Drive, AWS S3, OneDrive)
4. Keep 4 weekly backups (rotating)

### Automated Backup (Monthly)

Option 1: GitHub (not recommended—DB files are large)
- Don't commit `.db` files to Git

Option 2: Cloud Storage
- Add backup script that uploads to AWS S3
- Run via cron job (daily/weekly)

Option 3: Railway Database (if available)
- Use Railway's native database service
- Automatically backed up

---

## Production Checklist

Before going live:

- [ ] Database persistence configured (Railway volume)
- [ ] Environment variables set correctly
- [ ] Backend API URL correct in frontend
- [ ] CORS configured for production domain
- [ ] Database backup strategy in place
- [ ] Test all CRUD operations (create, read, update, delete)
- [ ] Test data import (`npm run import`)
- [ ] Monitor error logs first 24 hours
- [ ] Set up scheduled backups
- [ ] Document deployment process for team

---

## Troubleshooting

### Frontend shows 404 or "Cannot GET /"

**Problem:** Frontend not being served
**Solution:** 
1. Ensure `app.use(express.static(...))` is in `server.js`
2. Ensure frontend is built: `npm run build` creates `dist/` folder
3. Restart backend service

### API calls return 500 error

**Problem:** Backend error
**Solution:**
1. Check server logs in Railway dashboard
2. Verify database file exists
3. Verify CORS is enabled: `app.use(cors())`

### Database changes lost after restart

**Problem:** No persistent storage
**Solution:**
1. Add Railway persistent volume (see above)
2. Mount to path where `crm.db` is stored

### Environment variable not working

**Problem:** Variable not set
**Solution:**
1. Verify variable is in Railway Variables section
2. Redeploy after adding variable
3. Check variable name matches code usage

---

## Monitoring & Maintenance

### Daily
- Check error logs in Railway dashboard
- Verify API is responding

### Weekly
- Download backup of `crm.db`
- Review usage metrics

### Monthly
- Review error logs for patterns
- Test data import process
- Verify backups are working

---

## Scaling (Future)

When you outgrow single-server setup:

1. **Database:** Switch from SQLite to PostgreSQL
   - Update `server.js` to use `pg` package
   - Railway offers PostgreSQL as add-on
   - Cost: ~$15/month

2. **Server:** Add more instances
   - Railway auto-scales
   - Cost increases with usage

3. **Frontend:** Use CDN (CloudFlare)
   - Cache static assets globally
   - Cost: Free tier available

---

## Rollback Procedure

If deployment breaks:

1. **Railway:** Automatic previous build is available
   - Dashboard → Deployments → Select previous version
   - Takes ~1 minute

2. **Manual:** 
   - Git revert to previous commit
   - Push to GitHub
   - Auto-redeploy

---

## Cost Summary

| Platform | Monthly Cost | Effort | Notes |
|----------|--------------|--------|-------|
| **Railway** | Free-$20 | Easy | Recommended for starters |
| **Heroku** | $7-50 | Easy | Good alternative |
| **DigitalOcean** | $4-12 | Medium | More control |
| **AWS** | $10-100+ | Hard | Enterprise option |
| **Render** | Free-$12 | Easy | Similar to Railway |

---

## Next Steps

1. **Choose platform** (Railway recommended)
2. **Create account** and link GitHub
3. **Configure environment variables**
4. **Add persistent storage** for database
5. **Deploy and test**
6. **Set up backups**
7. **Monitor for 24 hours**

---

## Questions?

Refer to:
- **CLAUDE.md** — Technical architecture
- **CRM_CONFIGURATION_GUIDE.md** — Business configuration
- **IMPLEMENTATION_SUMMARY.md** — Project overview

---

**Last Updated:** May 2026
**Status:** Production Ready
