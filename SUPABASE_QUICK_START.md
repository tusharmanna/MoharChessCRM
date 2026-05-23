# Supabase Deployment Quick Start

Complete, FREE backend deployment in 30 minutes.

---

## Files Created

I've created two new files in `crm-app/backend/`:

1. **`db-supabase.js`** - PostgreSQL database layer (replaces db.js)
2. **`server-supabase.js`** - Express server with async/await (replaces server.js)

These work with Supabase's free PostgreSQL database.

---

## Step 1: Create Supabase Project (5 minutes)

### Sign Up
1. Go to https://supabase.com
2. Click **Sign Up**
3. Choose **GitHub** (easiest)
4. Authorize Supabase

### Create Database
1. Click **New Project**
2. Name: `moharcrm`
3. Password: Generate strong password (save it!)
4. Region: Pick closest to you
5. Click **Create new project** (wait 2-3 minutes)

### Get Connection String
1. Project Settings → **Database** → **Connection Pooling** 
2. Copy the **Connection String (URI)**
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
   ```
3. **Save this!** You'll need it in Step 4

---

## Step 2: Update Backend Code (5 minutes)

### Replace Files

```bash
cd crm-app/backend

# Remove old files
mv db.js db-sqlite.js.backup
mv server.js server-sqlite.js.backup

# Use new PostgreSQL versions
cp db-supabase.js db.js
cp server-supabase.js server.js
```

Or manually rename:
- `db-supabase.js` → `db.js`
- `server-supabase.js` → `server.js`

### Install PostgreSQL Driver

```bash
cd crm-app/backend
npm install pg dotenv
npm uninstall sql.js xlsx  # Remove old
```

### Create `.env.local`

Create file: `crm-app/backend/.env.local`

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3000
```

**Replace with your actual credentials from Supabase**

---

## Step 3: Test Locally (10 minutes)

### Start Backend

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

### Test API

Open another terminal:
```bash
curl http://localhost:3000/api/students

# Should return:
# {"students":[],"total":0,"limit":50,"offset":0}
```

### Create Test Student

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Student",
    "email": "test@example.com",
    "chess_experience": "beginner",
    "batch": "test-batch"
  }'
```

**Should return:**
```json
{"id": 1, "message": "Student created successfully"}
```

Verify in Supabase dashboard → SQL Editor:
```sql
SELECT COUNT(*) FROM students;
-- Should return 1
```

---

## Step 4: Deploy to Railway (Free Backend)

Railway gives you $5/month free credits (enough for this CRM).

### Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize access

### Deploy Backend
1. Click **New Project**
2. **Deploy from GitHub repo**
3. Select MoharCRM repo
4. Railway detects Express backend
5. Configure:
   - Build: `cd crm-app/backend && npm install`
   - Start: `cd crm-app/backend && npm start`

### Add Database URL
1. Click **Variables**
2. Add:
   ```
   DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?sslmode=require
   ```
   (From Supabase Step 1)

### Deploy
- Click **Deploy**
- Wait 3-5 minutes
- Get URL: `https://your-service.railway.app`

**Test it:**
```bash
curl https://your-service.railway.app/api/students
```

---

## Step 5: Deploy Frontend to Vercel (Free)

### Sign Up
1. Go to https://vercel.com
2. Sign up with GitHub

### Import Project
1. Click **Import Project**
2. Select MoharCRM repo
3. Framework: **Vite**
4. Root directory: **`crm-app/frontend`**

### Add API URL
1. **Environment Variables**
2. Name: `VITE_API_URL`
3. Value: `https://your-service.railway.app/api`
4. (Replace with your actual Railway URL)

### Deploy
- Click **Deploy**
- Wait 2-3 minutes
- Get URL: `https://your-app.vercel.app`

---

## Step 6: Test Production (5 minutes)

### Test Backend
```bash
curl https://your-service.railway.app/api/students
```

### Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Dashboard should load
3. Click **Students** (should be empty)
4. Create test student
5. Refresh page (student should still be there)

### Create Student via API
```bash
curl -X POST https://your-service.railway.app/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com",
    "chess_experience": "intermediate",
    "batch": "advanced"
  }'
```

---

## Step 7: Import Local Data (Optional)

If you have existing students:

### Export from Local SQLite
Use the scripts we created earlier:
```bash
node upload-to-render.js
node bulk-import.js
```

But update them to use your Supabase URL instead of Render.

### Or Manually Import
1. Supabase Dashboard → **SQL Editor**
2. Run INSERT statements for each student
3. Or use CSV import feature

---

## Cost Summary

| Service | Cost |
|---------|------|
| Supabase (PostgreSQL) | **FREE** (500MB) |
| Railway (Backend) | **FREE** ($5/mo credits) |
| Vercel (Frontend) | **FREE** (unlimited) |
| **TOTAL** | **FREE** |

---

## Troubleshooting

### Backend won't connect to Supabase
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Check password has no special characters that need escaping

### "relation does not exist" error
- Tables not created (check logs in Railway)
- Verify `.env.local` has correct DATABASE_URL
- Restart backend after fixing

### Frontend can't reach API
- Check VITE_API_URL in Vercel variables
- Make sure it includes `/api` at the end
- Test URL directly: `curl https://your-backend.railway.app/api/students`

### Data not appearing
- Verify INSERT succeeded in Supabase dashboard
- Check table name (case-sensitive in PostgreSQL)
- Run: `SELECT COUNT(*) FROM students;`

---

## Next Steps (After Deployment)

1. ✅ Verify everything works
2. ✅ Test creating/editing students
3. ✅ Add your real data (import from Excel)
4. ✅ Share frontend URL with team

---

## Checklist

- [ ] Supabase project created
- [ ] Connection string saved
- [ ] Backend files replaced (db.js, server.js)
- [ ] `.env.local` created with DATABASE_URL
- [ ] Backend tested locally
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] API URL set in Vercel
- [ ] End-to-end test complete
- [ ] Data imported (optional)

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend | https://your-service.railway.app |
| Database | Supabase Dashboard |
| Dashboard | https://app.supabase.com |

---

**Total time: ~30 minutes from zero to production! 🚀**

Everything is FREE and production-ready!
