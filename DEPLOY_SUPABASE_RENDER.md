# Deploy Supabase + Render + Vercel (All FREE)

Complete guide to deploy MoharCRM with PostgreSQL (Supabase) backend on Render.

---

## Architecture

```
Vercel Frontend (Free)
    ↓ API calls
Render Backend (Free - no persistent disk needed!)
    ↓ SQL queries
Supabase PostgreSQL (Free - 500MB)
```

**Total Cost: $0/month** ✅

---

## Prerequisites

✅ **Already done:**
- Supabase project created
- Database connection string saved
- `db.js` updated to PostgreSQL
- `.env.local` created locally

---

## Step 1: Install Dependencies

```bash
cd crm-app/backend

# If not already done:
npm install pg dotenv
npm uninstall sql.js xlsx
```

---

## Step 2: Update `server.js`

You have two options:

### Option A: Rename Files (Fastest)
```bash
cd crm-app/backend

# If using the files we created:
mv server.js server-sqlite.js
mv server-supabase.js server.js
```

### Option B: Manual Update
Open `crm-app/backend/server.js` and:
1. Change `const { initDatabase, query, queryOne, run } = require('./db');` 
   - (Should already point to './db' which now uses PostgreSQL)
2. Add `async` to all endpoint handlers
3. Add `await` before all `query()`, `queryOne()`, `run()` calls
4. Change `LIKE ?` to `ILIKE $1` (PostgreSQL syntax)
5. Change `INSERT OR REPLACE` to `ON CONFLICT ... DO UPDATE`

See `server-supabase.js` for complete example.

---

## Step 3: Create `.env.local`

File: `crm-app/backend/.env.local`

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3000
```

**Get the connection string from:**
1. Supabase Dashboard
2. Project Settings → **Database** → **Connection Pooling**
3. Copy the **Connection String (URI)**

---

## Step 4: Test Locally

```bash
cd crm-app/backend
npm start
```

**Should see:**
```
✓ Connected to Supabase PostgreSQL
✓ Database schema initialized
✓ Server running on http://localhost:3000
```

**Test API:**
```bash
curl http://localhost:3000/api/students
# Returns: {"students":[],"total":0,"limit":50,"offset":0}
```

---

## Step 5: Deploy to Render

### Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize access

### Create Web Service

1. Click **New +** → **Web Service**
2. Select **Build and deploy from a Git repository**
3. Connect GitHub account if needed
4. Select **MoharCRM** repository
5. Click **Connect**

### Configure Service

**Settings:**
- **Name:** `moharcrm-backend` (or any name)
- **Environment:** `Node`
- **Region:** Choose closest to you (or default)
- **Branch:** `main` (or `master`)

**Build Settings:**
- **Build Command:** 
  ```
  cd crm-app/backend && npm install
  ```
- **Start Command:** 
  ```
  cd crm-app/backend && npm start
  ```

**Instance Type:**
- Select **Free** (sufficient for CRM)

### Add Environment Variables

1. Scroll to **Environment** section
2. Click **Add Environment Variable**
3. Add:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?sslmode=require
   ```
   (Copy from Supabase connection string)

4. Add:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### Deploy

1. Click **Create Web Service**
2. Render builds and deploys (3-5 minutes)
3. Wait for "Your service is live" message
4. Get your URL: `https://moharcrm-backend.onrender.com`

### Check Logs

If deployment fails:
1. Click **Logs** tab
2. Look for errors
3. Common issues:
   - Wrong DATABASE_URL format
   - Missing `pg` package
   - PORT already in use

---

## Step 6: Deploy Frontend to Vercel

### Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Import Project
1. Click **Import Project** or **Add New** → **Project**
2. Select **Import Git Repository**
3. Find and select **MoharCRM**
4. Click **Import**

### Configure Frontend
1. **Framework:** Vite (auto-detected)
2. **Root Directory:** `crm-app/frontend`
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)

### Add Environment Variable
1. **Environment Variables** section
2. Name: `VITE_API_URL`
3. Value: `https://moharcrm-backend.onrender.com/api`
   - (Use your actual Render URL)
4. Apply to: **Production, Preview, Development**

### Deploy
1. Click **Deploy**
2. Wait 2-3 minutes
3. Get URL: `https://moharcrm.vercel.app`

---

## Step 7: Test Everything

### Test Backend API
```bash
curl https://moharcrm-backend.onrender.com/api/students
# Should return: {"students":[],"total":0,"limit":50,"offset":0}
```

### Test Frontend
1. Visit `https://moharcrm.vercel.app`
2. Dashboard should load
3. Click **Students** tab
4. Should show empty list
5. Create a test student
6. Refresh page
7. Student should still be there

### Test Create Student
```bash
curl -X POST https://moharcrm-backend.onrender.com/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Student",
    "email": "test@example.com",
    "chess_experience": "beginner",
    "batch": "test-batch"
  }'

# Should return: {"id": 1, "message": "Student created successfully"}
```

---

## Step 8: Enable Auto-Deploy (Automatic)

Both Render and Vercel auto-deploy when you push to GitHub:

```bash
# Make a change
git add -A
git commit -m "Deploy Supabase PostgreSQL backend"
git push

# Both services automatically redeploy (~3-5 minutes)
```

---

## Verify in Supabase Dashboard

Check that data is actually in PostgreSQL:

1. Supabase Dashboard
2. **SQL Editor**
3. Run:
   ```sql
   SELECT COUNT(*) FROM students;
   ```
4. Should show your created students

---

## Cost Breakdown

| Service | Cost | Storage |
|---------|------|---------|
| **Vercel** (Frontend) | FREE | Unlimited |
| **Render** (Backend) | FREE | N/A (Supabase handles DB) |
| **Supabase** (Database) | FREE | 500MB PostgreSQL |
| **TOTAL** | **FREE** | **500MB** |

---

## Troubleshooting

### Backend won't start on Render
**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
- Check DATABASE_URL is correct in Render Variables
- Verify Supabase connection string from dashboard
- Redeploy after fixing variables

### Frontend shows "Cannot reach API"
**Problem:** 404 or Connection refused

**Solution:**
- Check VITE_API_URL in Vercel Variables
- Make sure it includes `/api` at end
- Test URL directly: `curl https://your-render-url/api/students`
- Redeploy frontend with correct URL

### Data not appearing
**Problem:** API returns empty list

**Solution:**
- Check in Supabase SQL Editor: `SELECT COUNT(*) FROM students;`
- Verify INSERT statements succeeded
- Check table names (case-sensitive in PostgreSQL)

### Render says "Port 3000 is not available"
**Problem:** Port conflict

**Solution:**
- Don't set PORT manually on Render
- Let Render assign the port automatically
- Remove PORT from environment variables on Render

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] `.env.local` created with DATABASE_URL
- [ ] Backend tested locally (`npm start`)
- [ ] `db.js` is PostgreSQL version
- [ ] `server.js` has async/await
- [ ] Backend deployed to Render
- [ ] DATABASE_URL added to Render variables
- [ ] Render deployment successful (logs show "Server running")
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL added to Vercel variables
- [ ] Frontend deployment successful
- [ ] End-to-end test complete (Vercel → Render → Supabase)
- [ ] Git push triggers auto-deploys

---

## Quick Reference

| Item | URL |
|------|-----|
| **Frontend** | https://your-app.vercel.app |
| **Backend** | https://your-service.onrender.com |
| **Supabase Dashboard** | https://app.supabase.com |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## Next Steps

1. ✅ Test locally
2. ✅ Push to GitHub
3. ✅ Deploy to Render
4. ✅ Deploy to Vercel
5. ✅ Test production
6. ✅ Share frontend URL with team

---

**You now have a production-ready CRM running entirely on FREE services!** 🎉

- No credit card required
- No storage costs
- Auto-deploying from GitHub
- Fully scalable PostgreSQL database

**Total deployment time: ~20 minutes**
