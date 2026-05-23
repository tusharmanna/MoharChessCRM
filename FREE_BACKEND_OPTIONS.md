# Free Backend Hosting Options (With Persistent Storage)

Since Render's free tier doesn't include disk storage, here are the best free alternatives for MoharCRM:

---

## Option 1: Railway (Recommended for SQLite) ⭐

**Pros:**
- ✅ Free tier with persistent storage included
- ✅ $5/month free credits (more than enough)
- ✅ Same simplicity as Render
- ✅ GitHub integration with auto-deploy
- ✅ Easy volume/disk setup
- ✅ Great documentation

**Cons:**
- Slightly slower than paid options
- Free credits expire monthly (but $5 is usually enough)

**Cost:** Free ($5/month credit—sufficient for small CRM)

**Setup:**
1. Go to https://railway.app
2. Create account with GitHub
3. New Project → Deploy from GitHub
4. Select MoharCRM repo
5. Add Volume: `/app` → 1GB
6. Add env vars: `NODE_ENV=production`, `PORT=3000`
7. Deploy—auto-redeploys on git push

**Estimated Usage:** ~2 credits/month (free tier covers it)

---

## Option 2: Fly.io (Lightweight & Fast) 

**Pros:**
- ✅ Generous free tier
- ✅ Persistent storage included
- ✅ Global edge nodes (faster)
- ✅ No credit card required initially
- ✅ Great performance

**Cons:**
- Slightly more complex setup (uses Dockerfile)
- Less familiar than Railway
- Can get confusing with scaling

**Cost:** Free tier generous, then $0.01/hour per app

**Setup is more complex** - need to create Dockerfile and `fly.toml` config

---

## Option 3: Migrate to Free Database (PlanetScale or Supabase)

**Best if:** You want to move away from SQLite

**PlanetScale (MySQL - Free):**
- ✅ Free tier: 5GB database
- ✅ Great for Node.js/Express
- ✅ Easy setup
- ✅ Can run backend on any free serverless (Vercel, Netlify)

**Changes needed:**
- Update `db.js` to use `mysql2` instead of sql.js
- Migrate schema to MySQL
- Small code changes in server.js

**Supabase (PostgreSQL - Free):**
- ✅ Free tier: 500MB database
- ✅ Built-in authentication
- ✅ Realtime capabilities
- ✅ Good for future scaling

**Changes needed:**
- Similar to PlanetScale
- Update `db.js` to use `pg` (PostgreSQL client)

---

## Option 4: Self-Hosted (Advanced)

**Free cloud VPS options:**
- **Oracle Cloud Always Free** - 2 ARM instances, 20GB storage (truly free)
- **Google Cloud** - $300 free credits (expires after 1 year)
- **AWS Free Tier** - 750 hours/month EC2 (first year only)

**Pros:**
- ✅ Full control
- ✅ Persistent storage included

**Cons:**
- ❌ Complex setup (SSH, server management)
- ❌ Need to handle security, backups
- ❌ More maintenance

---

## Comparison Table

| Option | Cost | Storage | Setup | Speed | Notes |
|--------|------|---------|-------|-------|-------|
| **Railway** | $5/mo (free) | 1GB | ⭐⭐⭐ Easy | ⭐⭐⭐ Good | **BEST for SQLite** |
| **Fly.io** | Free (generous) | Included | ⭐⭐ Moderate | ⭐⭐⭐⭐ Very Good | Need Dockerfile |
| **PlanetScale** | Free (5GB DB) | 5GB | ⭐⭐⭐ Easy | ⭐⭐⭐ Good | Requires code changes |
| **Supabase** | Free (500MB DB) | 500MB | ⭐⭐⭐ Easy | ⭐⭐⭐ Good | Requires code changes |
| **Oracle Always Free** | Truly Free | 20GB | ⭐⭐ Complex | ⭐⭐⭐ Good | Self-hosted complexity |

---

## My Recommendation: Railway ⭐

**Why Railway is best for you:**
1. **Free storage** - 1GB disk for crm.db (no extra cost)
2. **Same setup as Render** - you already know how to deploy
3. **No code changes** - works with existing sql.js code
4. **Auto-deploy** - push to GitHub → auto-redeploys
5. **Simple scaling** - upgrade if needed later
6. **Cost** - $5/month free credits is usually enough

**Quick comparison to Render:**
- Render Free: No disk (pay $6/month extra)
- Railway Free: Disk included, $5/month credits

---

## Quick Start: Deploy to Railway

### Step 1: Create Railway Account
```bash
Go to https://railway.app
Sign up with GitHub
Authorize access
```

### Step 2: Deploy Backend
1. **New Project** → **Deploy from GitHub repo**
2. Select **MoharCRM**
3. Railway auto-detects Express backend
4. Configure:
   - Build: `cd crm-app/backend && npm install`
   - Start: `cd crm-app/backend && npm start`

### Step 3: Add Persistent Storage
1. **Storage** tab
2. **Add Volume**
3. Mount path: `/app`
4. Size: 1 GB
5. Click **Create**

### Step 4: Set Environment Variables
1. **Variables** tab
2. Add:
   ```
   NODE_ENV = production
   PORT = 3000
   ```

### Step 5: Deploy
Railway auto-deploys. Wait 3-5 minutes.

### Step 6: Upload Your Data
```bash
# From MoharCRM root
node upload-to-render.js
node bulk-import.js
```

Replace "moharchesscrm" with your Railway service name.

### Step 7: Deploy Frontend to Vercel (Free)
1. Go to https://vercel.com
2. Import MoharCRM repo
3. Root directory: `crm-app/frontend`
4. Add env: `VITE_API_URL=your-railway-url/api`
5. Deploy

**Total Cost: FREE** (Railway $5/month free credits + Vercel free tier)

---

## Migration Path: SQLite → PostgreSQL (Optional)

If you want to eventually move to a managed database:

**Step 1: Use Supabase (free PostgreSQL)**
- Sign up at https://supabase.com
- Create new project (free: 500MB)
- Get connection string

**Step 2: Update db.js**
Change from sql.js to `pg` client:
```javascript
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
```

**Step 3: Update queries**
- `query()` → async/await with `client.query()`
- `run()` → `client.query()` with INSERT/UPDATE

**Step 4: Migrate schema**
Run SQL scripts to create tables in PostgreSQL

**Pros:**
- Scales better than SQLite
- Better for production
- Supabase handles backups

**Cons:**
- Code changes needed
- Takes 2-3 hours to implement

---

## Decision Matrix

**Choose Railway if:**
- ✅ You want free storage NOW
- ✅ You want minimal code changes
- ✅ You want the simplest setup
- ✅ SQLite is fine for your use case

**Choose PlanetScale if:**
- ✅ You want to learn MySQL
- ✅ You're willing to make code changes
- ✅ You want better scalability
- ✅ Free 5GB database is better than 1GB

**Choose Supabase if:**
- ✅ You want PostgreSQL
- ✅ You want real-time features later
- ✅ You need authentication management
- ✅ Code changes are okay

**Choose self-hosted (Oracle) if:**
- ✅ You want truly free (no expiration)
- ✅ You have time for server management
- ✅ You're okay with complexity

---

## Next Steps

### If you choose Railway (Recommended):
```bash
1. Create Railway account
2. Deploy from GitHub
3. Add persistent storage
4. Run: node upload-to-render.js
5. Run: node bulk-import.js
6. Test: curl your-railway-url/api/students
```

### If you choose Database Migration:
- I can help you update db.js for PlanetScale or Supabase
- Would take 2-3 hours to implement
- But gives you better long-term scalability

---

**Which option would you like to use?**

1. Railway (easiest, recommended)
2. Fly.io (faster, slightly harder)
3. PlanetScale (better scalability, code changes)
4. Supabase (future-proof, code changes)
5. Self-hosted (free, complex)

Let me know and I can create a step-by-step guide!
