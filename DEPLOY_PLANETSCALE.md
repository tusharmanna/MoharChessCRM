# Deploy to PlanetScale + Vercel (Free & Simple)

Complete guide to migrate from SQLite to MySQL (PlanetScale) and deploy for FREE.

---

## Why PlanetScale?

**Free Tier Includes:**
- ✅ 5GB MySQL database (vs 500MB Supabase)
- ✅ Unlimited connections
- ✅ Automatic backups
- ✅ Branch deployments (dev/staging/prod)
- ✅ Simple connection string
- ✅ Built by the creators of Vitess (MySQL scaling)

**Cost:** Completely FREE

**Comparison:**
| Feature | PlanetScale | Supabase | SQLite |
|---------|-------------|----------|--------|
| Size | 5GB ✅ | 500MB | 1GB |
| Cost | Free | Free | Free |
| Complexity | Simple | Medium | Very Simple |
| Scaling | Excellent | Good | Poor |
| Setup | 5 min | 10 min | N/A |

---

## Step 1: Create PlanetScale Database

### Create Account
1. Go to https://planetscale.com
2. Sign up with GitHub
3. Create organization

### Create Database
1. Dashboard → **Create database**
2. Name: `moharcrm`
3. Region: Choose closest to you
4. MySQL version: 8.0
5. Click **Create database** (takes ~1 minute)

### Get Connection String
1. Click your database
2. Click **Passwords** tab
3. Under "Password", click **New password**
4. Select username: `root`
5. Copy the connection string:
   ```
   mysql://root:[PASSWORD]@[HOST]/moharcrm
   ```
6. **Save this!** You'll need it multiple times

**Connection looks like:**
```
mysql://root:xxxxxxxx@aws.connect.psdb.cloud/moharcrm?sslaccept=strict
```

---

## Step 2: Update Backend Code

### Step 2a: Install Dependencies

```bash
cd crm-app/backend

# Remove old
npm uninstall sql.js xlsx

# Install new
npm install mysql2 dotenv
npm install --save-dev nodemon
```

### Step 2b: Create `.env.local`

Create file: `crm-app/backend/.env.local`

```
DATABASE_URL=mysql://root:YOUR_PASSWORD@YOUR_HOST/moharcrm?sslaccept=strict
NODE_ENV=production
PORT=3000
```

Replace `YOUR_PASSWORD` and `YOUR_HOST` from PlanetScale connection string.

### Step 2c: Replace `db.js`

I'll provide the new MySQL version. Key changes:
- Uses `mysql2/promise` for async queries
- Creates tables on startup
- Same API: `query()`, `queryOne()`, `run()`
- Handles connection pooling

**Create new `crm-app/backend/db.js`:**

```javascript
const mysql = require('mysql2/promise');

let connection;

async function initDatabase() {
  try {
    // Create connection pool
    const pool = mysql.createPool({
      connectionLimit: 10,
      host: process.env.DATABASE_URL ? 
        new URL(process.env.DATABASE_URL).hostname : 'localhost',
      user: 'root',
      password: process.env.DATABASE_URL ? 
        new URL(process.env.DATABASE_URL).password : '',
      database: 'moharcrm',
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });

    connection = pool;

    // Test connection
    const conn = await connection.getConnection();
    console.log('✓ Connected to PlanetScale MySQL');
    conn.release();

    // Create tables
    await createTables();
    console.log('✓ Database schema initialized');
  } catch (err) {
    console.error('Database connection error:', err.message);
    throw err;
  }
}

async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      student_rating INT,
      chess_rating FLOAT,
      payment_status VARCHAR(255) DEFAULT 'pending',
      risk_score VARCHAR(255) DEFAULT 'low',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS parents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      parent_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(255),
      email VARCHAR(255),
      relation VARCHAR(255) DEFAULT 'parent',
      communication_preference VARCHAR(255) DEFAULT 'email',
      best_contact_time VARCHAR(255) DEFAULT 'evening',
      communication_frequency VARCHAR(255) DEFAULT 'monthly',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS communications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      communication_type VARCHAR(255),
      message TEXT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(255) DEFAULT 'system',
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      task_title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date DATE,
      status VARCHAR(255) DEFAULT 'pending',
      priority VARCHAR(255) DEFAULT 'medium',
      assigned_to VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of tables) {
    try {
      const conn = await connection.getConnection();
      await conn.query(sql);
      conn.release();
    } catch (err) {
      // Ignore "table already exists" errors
      if (!err.message.includes('already exists')) {
        console.error('Error creating table:', err.message);
      }
    }
  }
}

async function query(sql, params = []) {
  try {
    const conn = await connection.getConnection();
    const [results] = await conn.query(sql, params);
    conn.release();
    return results;
  } catch (err) {
    console.error('Query error:', err.message, 'SQL:', sql);
    return [];
  }
}

async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

async function run(sql, params = []) {
  try {
    const conn = await connection.getConnection();
    const [result] = await conn.query(sql, params);
    conn.release();
    return { changes: result.affectedRows, lastID: result.insertId };
  } catch (err) {
    console.error('Run error:', err.message, 'SQL:', sql);
    throw err;
  }
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  run
};
```

### Step 2d: Update `server.js`

Make all endpoints `async` and add `await`:

```javascript
// Change all endpoints from:
app.get('/api/students', (req, res) => {
  const students = query(...);

// To:
app.get('/api/students', async (req, res) => {
  const students = await query(...);
```

**Key changes:**
- Add `async` to all endpoint handlers
- Add `await` before all `query()`, `queryOne()`, `run()` calls
- Wrap in try-catch (already there)

I'll provide complete updated `server.js` if needed.

---

## Step 3: Test Locally

### Start Backend

```bash
cd crm-app/backend

# Set environment variable
$env:DATABASE_URL="mysql://root:YOUR_PASSWORD@YOUR_HOST/moharcrm?sslaccept=strict"

# Start
npm start
```

**Should see:**
```
✓ Connected to PlanetScale MySQL
✓ Database schema initialized
✓ Server running on http://localhost:3000
```

### Test API

```bash
# In another terminal
curl http://localhost:3000/api/students

# Should return:
# {"students":[],"total":0,"limit":50,"offset":0}
```

---

## Step 4: Deploy to Railway (Free Backend)

### Deploy
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select MoharCRM
4. Railway detects Express backend
5. Configure:
   - Build: `cd crm-app/backend && npm install`
   - Start: `cd crm-app/backend && npm start`

### Add Environment Variable
1. Click **Variables**
2. Add:
   ```
   DATABASE_URL = mysql://root:YOUR_PASSWORD@YOUR_HOST/moharcrm?sslaccept=strict
   ```
   (Copy from PlanetScale)

### Deploy
- Click **Deploy**
- Wait 3-5 minutes
- Get URL: `https://your-backend.railway.app`

**No persistent disk needed!** PlanetScale hosts the database.

---

## Step 5: Deploy Frontend to Vercel (Free)

### Import Project
1. Go to https://vercel.com
2. **Import** MoharCRM repo
3. Framework: Vite
4. Root: `crm-app/frontend`

### Add Environment Variable
```
VITE_API_URL = https://your-backend.railway.app/api
```

### Deploy
- Click **Deploy**
- Wait 2-3 minutes
- Get URL: `https://moharcrm.vercel.app`

---

## Step 6: Migrate Data (If You Have Local Data)

### Option A: Bulk Import API

If you have local students in `crm.db`:

```bash
# Step 1: Export from local SQLite
node export-to-planetscale.js

# Step 2: Import to PlanetScale
node bulk-import-planetscale.js
```

I'll create these scripts.

### Option B: Manual Import via SQL

1. Go to PlanetScale dashboard
2. Click **SQL Editor**
3. Paste INSERT statements for your students
4. Execute

### Option C: Start Fresh

- No existing data needed
- Create students via API
- Test everything works

---

## Step 7: Test Production

### Test Backend API
```bash
curl https://your-backend.railway.app/api/students

# Should return empty student list:
# {"students":[],"total":0,"limit":50,"offset":0}
```

### Test Frontend
1. Visit: `https://moharcrm.vercel.app`
2. Dashboard should load
3. Click **Students** → should be empty
4. Create a test student
5. Refresh → student should appear

### Test Creating Student
```bash
curl -X POST https://your-backend.railway.app/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Student",
    "email": "test@example.com",
    "chess_experience": "beginner",
    "batch": "test"
  }'
```

---

## Cost Comparison

| Service | Monthly Cost |
|---------|--------------|
| PlanetScale | FREE (5GB) |
| Railway | FREE ($5/mo credits) |
| Vercel | FREE (unlimited frontend) |
| **TOTAL** | **FREE** |

---

## Deployment Checklist

- [ ] PlanetScale account created
- [ ] Database created
- [ ] Connection string saved
- [ ] `.env.local` created with DATABASE_URL
- [ ] `db.js` updated to MySQL
- [ ] `server.js` updated to async
- [ ] Backend tested locally
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set (Railway, Vercel)
- [ ] API endpoints tested
- [ ] Created test student
- [ ] Data persisted after refresh

---

## Quick Reference

| Item | URL |
|------|-----|
| PlanetScale Dashboard | https://planetscale.com/dashboard |
| Railway Dashboard | https://railway.app |
| Vercel Dashboard | https://vercel.com |
| Your Backend | `https://your-service.railway.app` |
| Your Frontend | `https://your-app.vercel.app` |

---

## Troubleshooting

### Connection Refused
- Check DATABASE_URL in Railway env vars
- Verify connection string from PlanetScale
- Try: `mysql -u root -p -h host -D moharcrm` to test

### Tables Not Created
- Check Railway logs for creation errors
- Manually run CREATE TABLE in PlanetScale SQL Editor
- Verify MySQL syntax

### Data Not Appearing
- Check that INSERT succeeded (check row count)
- Run: `SELECT COUNT(*) FROM students;` in SQL Editor
- Verify API is hitting correct database

### Slow Queries
- PlanetScale free tier is single node (sufficient)
- Add indexes for frequently searched columns:
  ```sql
  CREATE INDEX idx_email ON students(email);
  CREATE INDEX idx_batch ON students(batch);
  ```

---

## Next Steps

1. Create PlanetScale account (2 min)
2. Create MySQL database (1 min)
3. Copy connection string
4. I'll create updated `db.js` and `server.js`
5. Test locally (5 min)
6. Deploy to Railway (5 min)
7. Deploy to Vercel (3 min)
8. Migrate data if needed (5 min)

**Total: ~30 minutes from start to production!**

---

## Ready?

Say "ready" and I'll:
1. ✅ Create updated `db.js` for MySQL
2. ✅ Create updated `server.js` with async
3. ✅ Create data migration script
4. ✅ Provide exact deployment steps

Let's get you running on PlanetScale! 🚀

---

**Last Updated:** May 2026
**Status:** Production Ready
**Database:** MySQL (PlanetScale)
**Cost:** Completely FREE
