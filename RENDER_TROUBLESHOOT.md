# Render Deployment Troubleshooting: No Data Issue

If your Render backend returns empty data even though you have students in your local database, follow these steps.

---

## Problem

Backend URL (e.g., https://moharchesscrm.onrender.com/api/students) returns:
```json
{
  "students": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

But you have data locally or previously uploaded.

---

## Root Cause

The Render persistent disk might not be mounted correctly, or the database path is wrong.

---

## Fix Steps (15 minutes)

### Step 1: Check Render Logs

1. Go to Render Dashboard → Your Backend Service
2. Click **Logs** tab
3. Look for these messages:
   - `Database path: /app/crm-app/backend/crm.db` ✅ Good
   - `DB load error:` ❌ Problem
   - `Creating new database at:` → Means old DB file not found

**Screenshot and note what you see**

### Step 2: Verify Persistent Disk

1. In Render Dashboard → Your Backend Service
2. Go to **Disk** section
3. Check:
   - Mount path (should be `/app` or `/app/crm-app/backend`)
   - Size (shows usage)

**If no disk exists:**
1. Click **Add Disk**
2. Mount path: `/app`
3. Size: 1 GB
4. Save

### Step 3: Redeploy Backend

After adding/checking disk:

1. Go to **Deployments** tab
2. Click the 3 dots on latest deployment
3. Click **Redeploy**
4. Wait 3-5 minutes for redeploy

### Step 4: Import Data

Once redeployed, import your data:

**Option A: From local backup**
1. Download your local `crm.db` file from `crm-app/backend/crm.db`
2. Use Render CLI to upload:
   ```bash
   npm install -g @render-oss/render-cli
   render login
   render upload --service moharchesscrm --path ./crm.db:/app/crm-app/backend/crm.db
   ```
3. Redeploy again

**Option B: Re-run import**
If you have the import file:
1. Use Render Shell (if available in your plan)
2. Or create a temporary endpoint to run import

**Option C: Manually re-add data**
Create students via the API:
```bash
curl -X POST https://moharchesscrm.onrender.com/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "chess_experience": "beginner",
    "batch": "batch1"
  }'
```

### Step 5: Verify It Works

1. Visit: https://moharchesscrm.onrender.com/api/students
2. Should now return your students data
3. Create a test student to verify write works
4. Refresh page - data should persist

---

## Common Issues

### "Creating new database at:" in logs
**Problem:** Old database file not found  
**Solution:** Persistent disk not mounted OR mounted at wrong path

**Fix:**
1. Check disk mount path in Step 2
2. If path is wrong, recreate disk with correct path: `/app`
3. Manually upload your database file via Render CLI

### "DB load error:" in logs
**Problem:** Database file exists but can't be read

**Solution:**
1. File might be corrupted
2. Try uploading a fresh backup
3. Or restore from local copy

### Still showing 0 students after import
**Problem:** Import succeeded but data not visible

**Solution:**
1. Check logs for query errors
2. Verify students were inserted (check total count)
3. Try a specific query: `https://moharchesscrm.onrender.com/api/students?limit=1`
4. Restart Render service (redeploy)

---

## Using Render CLI to Upload Database

### Install CLI
```bash
npm install -g @render-oss/render-cli
```

### Login
```bash
render login
# Opens browser for authentication
```

### Upload your database
```bash
# From directory containing crm.db
render upload --service moharchesscrm --path ./crm.db:/app/crm-app/backend/crm.db
```

### Download database from Render
```bash
# Save Render database to backup
render download --service moharchesscrm --path /app/crm-app/backend/crm.db

# Will download as crm.db in current directory
```

---

## Manual Database Recovery

If CLI doesn't work:

### Create via API Script

Create `seed-data.sh`:
```bash
#!/bin/bash

BACKEND_URL="https://moharchesscrm.onrender.com"

# Add students
curl -X POST $BACKEND_URL/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com",
    "chess_experience": "intermediate",
    "batch": "advanced"
  }'

curl -X POST $BACKEND_URL/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Bob",
    "last_name": "Johnson",
    "email": "bob@example.com",
    "chess_experience": "beginner",
    "batch": "beginners"
  }'
```

Run: `bash seed-data.sh`

---

## Backup Strategy (Going Forward)

### Daily Backup
1. Set a reminder to download database weekly:
   ```bash
   render download --service moharchesscrm --path /app/crm-app/backend/crm.db
   mv crm.db backups/crm-$(date +%Y%m%d).db
   ```

2. Or upload to cloud:
   ```bash
   render download --service moharchesscrm --path /app/crm-app/backend/crm.db
   aws s3 cp crm.db s3://your-bucket/crm-$(date +%Y%m%d).db
   ```

### Restore from Backup
```bash
# Download old backup from cloud/storage
render upload --service moharchesscrm --path ./crm-backup.db:/app/crm-app/backend/crm.db
# Redeploy
```

---

## Verify Fix Worked

**Checklist:**
- [ ] Render logs show database loading correctly
- [ ] Logs show "Database path: /app/crm-app/backend/crm.db"
- [ ] No "DB load error" in logs
- [ ] GET /api/students returns data (total > 0)
- [ ] Can create new student via API
- [ ] Data persists after refresh

---

## Still Not Working?

### Debug Steps

1. **Check database file exists:**
   ```bash
   render exec --service moharchesscrm ls -la /app/crm-app/backend/
   ```
   
   Should show `crm.db` with size > 0

2. **Check database can be read:**
   ```bash
   render exec --service moharchesscrm file /app/crm-app/backend/crm.db
   ```
   
   Should show it's a SQLite database

3. **Check table has data:**
   ```bash
   render exec --service moharchesscrm sqlite3 /app/crm-app/backend/crm.db "SELECT COUNT(*) FROM students;"
   ```
   
   Should show number > 0

4. **Share Render logs** with these checks and we can debug further

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| No disk mounted | Add disk in Render dashboard, mount at `/app` |
| "Creating new database" in logs | Disk mounted but file not there - upload via CLI |
| Database file corrupted | Restore from local backup via Render CLI upload |
| Data was imported locally | Upload local crm.db via Render CLI |
| Still no data after everything | Check logs with `render download` and inspect crm.db locally |

---

## Next Time

**Prevention:**
1. After any data change, backup: `render download --path /app/crm-app/backend/crm.db`
2. Store backups in cloud or Git (don't commit .db files, just backups)
3. Before redeploy, download current database as backup

---

**Need more help?**
Share:
1. Screenshot of Render logs
2. Disk configuration (mount path, size)
3. Output of: `curl https://moharchesscrm.onrender.com/api/stats`

---

**Last Updated:** May 2026
