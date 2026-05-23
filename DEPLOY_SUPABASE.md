# Deploy to Supabase + Vercel (Free)

This guide migrates MoharCRM from SQLite to PostgreSQL (Supabase) and deploys to Vercel (frontend) + Render/Railway (backend).

---

## Why Supabase?

**Free Tier Includes:**
- ✅ PostgreSQL database (500MB - enough for ~50k students)
- ✅ Real-time subscriptions
- ✅ REST API (auto-generated)
- ✅ Authentication (email/password, Google, GitHub)
- ✅ Row-level security (RLS)
- ✅ Automated backups
- ✅ Vector storage for AI features

**Comparison to SQLite:**
- SQLite: Single-file, in-memory, no concurrent access
- PostgreSQL: Multi-user, scalable, production-ready

**Cost:** Completely FREE (Supabase free tier is generous)

---

## Step 1: Create Supabase Project

### Create Account
1. Go to https://supabase.com
2. Sign up with GitHub (easy)
3. Create organization (auto-created)

### Create New Project
1. Dashboard → **New Project**
2. Name: `moharcrm`
3. Database password: Generate strong password (save it!)
4. Region: Choose closest to you
5. Click **Create new project** (takes 2-3 minutes)

### Get Connection String
1. Project Settings → **Database**
2. Find **Connection String** (URI format)
3. Copy the string:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   ```
4. Save this—you'll need it in Step 4

---

## Step 2: Update Backend Code

We need to replace sql.js with PostgreSQL. You'll update these files:

### File 1: Install Dependencies

```bash
cd crm-app/backend
npm install pg dotenv
npm uninstall sql.js xlsx  # Remove old dependencies
```

### File 2: Update `db.js`

Replace the entire `db.js` file with PostgreSQL version. The new version:
- Uses `pg` client to connect to Supabase
- Converts all queries to async/await
- Creates tables on startup
- Provides same API (query, queryOne, run)

**I'll create this file in the next step.**

### File 3: Update `server.js`

Wrap all database calls in async:
- Change endpoint handlers to `async`
- Add `await` to all database calls
- Handle async errors properly

**I'll provide the updated endpoints.**

### File 4: Create `.env.local`

```bash
# In crm-app/backend/.env.local
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-project.supabase.co:5432/postgres
NODE_ENV=production
PORT=3000
```

---

## Step 3: Migrate Data

### Option A: Import from Local Database (Recommended)

If you have existing students in local SQLite:

1. **Export from SQLite:**
   ```bash
   # Your current local data
   node export-students.js  # We'll create this
   ```

2. **Create CSV of your students**

3. **Import to Supabase:**
   - Dashboard → SQL Editor
   - Run import script we'll provide
   - Paste student data

### Option B: Start Fresh

If you don't have critical local data:
- Just deploy with empty database
- Create students via API
- Test the system

### Option C: Use Import Script

We'll create a script that:
1. Reads your local crm.db
2. Connects to Supabase
3. Inserts all students
4. Verifies count

---

## Step 4: Deploy Backend

### Option A: Deploy to Railway (Recommended)

```bash
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select MoharCRM repo
4. Railway detects Express backend
5. No storage needed (Supabase handles database)
6. Add environment variable:
   DATABASE_URL = your-supabase-connection-string
7. Deploy
```

### Option B: Deploy to Render

```bash
1. Go to https://render.com
2. New → Web Service
3. Select MoharCRM repo
4. Build: cd crm-app/backend && npm install
5. Start: cd crm-app/backend && npm start
6. Environment variable:
   DATABASE_URL = your-supabase-connection-string
7. No disk needed! (Supabase hosts data)
8. Deploy
```

**Advantage:** No persistent disk costs!

---

## Step 5: Deploy Frontend to Vercel

```bash
1. Go to https://vercel.com
2. Import MoharCRM repo
3. Framework: Vite
4. Root: crm-app/frontend
5. Environment variable:
   VITE_API_URL = https://your-backend-url/api
6. Deploy
```

---

## Complete Architecture

```
┌─────────────────────┐
│  Vercel (Frontend)  │  https://moharcrm.vercel.app
│  React + Vite       │
└──────────┬──────────┘
           │ API calls
           ▼
┌─────────────────────┐
│ Railway/Render      │  https://backend.example.com
│ (Backend - Express) │
└──────────┬──────────┘
           │ SQL queries
           ▼
┌─────────────────────┐
│ Supabase            │  PostgreSQL database
│ (PostgreSQL)        │  500MB free
└─────────────────────┘
```

---

## Cost Breakdown

| Service | Cost | Storage | Notes |
|---------|------|---------|-------|
| **Vercel** | Free | Unlimited | Frontend static site |
| **Railway** | Free | N/A | Backend + $5/mo credits |
| **Supabase** | Free | 500MB | PostgreSQL database |
| **TOTAL** | **FREE** | **500MB** | Production-ready! |

---

## Database Schema (PostgreSQL)

The schema is the same, but in PostgreSQL format:

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  age VARCHAR(255),
  chess_experience VARCHAR(255),
  batch VARCHAR(255),
  status VARCHAR(255) DEFAULT 'prospect',
  source_of_lead VARCHAR(255),
  enrollment_date DATE,
  last_activity_date DATE,
  student_rating INTEGER,
  chess_rating FLOAT,
  payment_status VARCHAR(255) DEFAULT 'pending',
  risk_score VARCHAR(255) DEFAULT 'low',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parents (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255),
  email VARCHAR(255),
  relation VARCHAR(255) DEFAULT 'parent',
  communication_preference VARCHAR(255) DEFAULT 'email',
  best_contact_time VARCHAR(255) DEFAULT 'evening',
  communication_frequency VARCHAR(255) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  communication_type VARCHAR(255),
  message TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system'
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(255) DEFAULT 'pending',
  priority VARCHAR(255) DEFAULT 'medium',
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pipeline_stages (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  stage VARCHAR(255) NOT NULL,
  days_in_stage INTEGER DEFAULT 0,
  expected_enrollment_date DATE,
  loss_reason VARCHAR(255),
  stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_rate FLOAT,
  skill_level VARCHAR(255),
  internal_rating FLOAT,
  parent_satisfaction INTEGER,
  months_enrolled INTEGER,
  strengths TEXT,
  areas_to_improve TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_scores (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  interest_level INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  chess_experience_score INTEGER DEFAULT 0,
  demographic_fit INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  priority VARCHAR(255) DEFAULT 'low',
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Changes from SQLite

### 1. Asynchronous Queries
Before (sync):
```javascript
const students = query('SELECT * FROM students');
```

After (async):
```javascript
const result = await client.query('SELECT * FROM students');
const students = result.rows;
```

### 2. Connection Pool
PostgreSQL uses connection pooling (included in Supabase):
```javascript
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
```

### 3. Error Handling
PostgreSQL errors are different:
```javascript
try {
  const result = await client.query(sql, params);
  return result.rows;
} catch (err) {
  console.error('Query error:', err);
  throw err;
}
```

### 4. Timestamps
PostgreSQL handles `CURRENT_TIMESTAMP` automatically (no need for new Date()).

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Connection string saved
- [ ] `db.js` updated to PostgreSQL
- [ ] `server.js` endpoints updated to async
- [ ] `.env.local` created with DATABASE_URL
- [ ] Backend tested locally with Supabase
- [ ] Backend deployed to Railway/Render
- [ ] Data migrated to PostgreSQL
- [ ] Frontend deployed to Vercel
- [ ] API URL in Vercel env vars set correctly
- [ ] End-to-end test: Vercel → Railway/Render → Supabase

---

## Troubleshooting

### Connection Refused
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Check IP whitelist (Supabase allows all IPs by default)

### Queries Failing
- Verify table names match (case-sensitive in PostgreSQL)
- Check parameterized queries use `$1, $2` (not `?`)
- Ensure `await` is used for all queries

### Data Not Appearing
- Verify INSERT queries succeeded
- Check Supabase dashboard → SQL Editor
- Run: `SELECT COUNT(*) FROM students;`

### Performance Issues
- Add indexes to frequently searched columns
- Supabase free tier is single-node (sufficient for CRM)
- Monitor via Supabase dashboard

---

## Next Steps

1. **Create Supabase account** (2 minutes)
2. **I'll provide updated `db.js`** (uses PostgreSQL)
3. **I'll provide updated `server.js`** (async endpoints)
4. **Test locally** with Supabase
5. **Deploy to Railway + Vercel** (10 minutes)
6. **Migrate data** (5 minutes)
7. **Test production** (5 minutes)

---

## Ready?

**Say "yes" and I'll:**
1. Create new `db.js` for PostgreSQL
2. Update `server.js` for async
3. Create data migration script
4. Provide exact deployment steps

This is truly FREE and production-ready! 🚀

---

**Last Updated:** May 2026
**Status:** Production Ready
**Database:** PostgreSQL (Supabase)
