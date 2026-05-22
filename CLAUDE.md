# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoharCRM is a student contact management system for chess academy administration. It's a full-stack web application built with React (frontend) and Express/Node.js (backend) using SQLite3 for data persistence.

## Running the Application

### Backend Setup
```powershell
# Terminal 1
cd crm-app/backend
npm install
npm start
```
Runs on **http://localhost:5000**

Available npm scripts:
- `npm start` - Start the Express server
- `npm run dev` - Same as start
- `npm run import` - Import Excel data from MoharData/Contact Information.xlsx into SQLite

### Frontend Setup
```powershell
# Terminal 2
cd crm-app/frontend
npm install
npm run dev
```
Runs on **http://localhost:5173** (Vite dev server)

**Environment configuration:**
Copy `.env.example` to `.env.local` (optional—defaults to `http://localhost:5000/api`):
```
VITE_API_URL=http://localhost:5000/api
```
The Vite dev server also proxies `/api` requests to the backend via `vite.config.js`.

Available npm scripts:
- `npm run dev` - Start Vite development server
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Utility Scripts

**Git Automation:**
- `push-changes.bat` - Interactive git push with confirmation and status review
  ```bash
  push-changes.bat
  ```
  Shows git status, asks for confirmation, lets you enter custom commit message

- `quick-push.bat` - Fast push without prompts (uses default message)
  ```bash
  quick-push.bat "Your commit message here"
  # Or with default message:
  quick-push.bat
  ```

**Data Migration to Render:**
- `upload-to-render.js` - Export local student data for import to Render
  ```bash
  node upload-to-render.js
  ```
  Reads local `crm.db`, counts students, creates `students-backup.json`

- `bulk-import.js` - Import students from backup to Render via API
  ```bash
  node bulk-import.js
  ```
  Uploads all students to running Render backend (takes ~30-60 seconds for 130 students)

## Architecture Overview

### Backend Structure (`crm-app/backend/`)

**Core Files:**
- `server.js` - Express API server with all REST endpoints (~226 lines)
  - CORS enabled for frontend communication
  - Body-parser for JSON parsing
  - RESTful endpoints for students, communications, tasks, metadata
  
- `db.js` - sql.js database initialization and schema (~61 lines)
  - Uses sql.js (JavaScript SQLite)—loads `crm.db` file into memory on startup
  - Creates 4 tables: students, parents, communications, tasks
  - Provides helper functions: `query()`, `queryOne()`, `run()` for database access
  
- `importData.js` - Excel import script
  - Reads Contact Information.xlsx and populates database
  - Run via `npm run import`

**Database:** `crm.db` (SQLite file in project root)

### Frontend Structure (`crm-app/frontend/`)

**Source Structure (`src/`):**
- `main.jsx` - React app entry point
- `App.jsx` - Main app component with routing/navigation
- `App.css` - Application styling
- `api.js` - Axios client utilities for API calls
- `index.css` - Global styles
- `components/` - React components
  - `Dashboard.jsx` - Student stats and overview
  - `StudentList.jsx` - Student directory with search/filter/pagination
  - `StudentDetail.jsx` - Individual student profile and management

**Build Tool:** Vite with @vitejs/plugin-react

## Database Schema

**students** table (CRM fields):
- id (auto-increment)
- first_name, last_name, email (unique), age
- chess_experience (beginner|intermediate|advanced)
- batch (class/group assignment)
- status (prospect|enrolled|active|alumni)
- source_of_lead (where inquiry came from)
- enrollment_date, last_activity_date
- student_rating (0-10 internal rating)
- chess_rating (numerical rating)
- payment_status (pending|paid|overdue)
- risk_score (low|medium|high)
- notes (free-form text)
- created_at, updated_at (timestamps)

**parents** table:
- id, student_id (FK)
- parent_name, phone_number, email
- relation (default: 'parent')
- communication_preference (email|sms|whatsapp)
- best_contact_time, communication_frequency
- created_at

**communications** table:
- id, student_id (FK)
- communication_type, message
- date, created_by
- Tracks all interactions with students

**tasks** table:
- id, student_id (FK)
- task_title, description
- due_date, status (pending|completed)
- priority (low|medium|high)
- assigned_to
- created_at

**pipeline_stages** table (Prospect journey):
- id, student_id (FK)
- stage (Inquiry|Interested|Trial Scheduled|Trial Completed|Negotiating|Enrolled|Lost)
- days_in_stage, expected_enrollment_date
- loss_reason, stage_entered_at, stage_updated_at

**progress** table (Student development):
- id, student_id (FK)
- attendance_rate, skill_level
- internal_rating, parent_satisfaction
- months_enrolled
- strengths, areas_to_improve
- last_updated

**lead_scores** table (Qualification scoring):
- id, student_id (FK)
- interest_level (0-3), engagement_score (0-3), chess_experience_score (0-2), demographic_fit (0-2)
- total_score (0-10), priority (low|medium|high)
- last_calculated

## API Endpoints

### Students
- `GET /api/students` - List with optional search, batch filter, status filter, pagination (limit, offset)
- `GET /api/students/:id` - Get single student with parents, communications, and tasks
- `POST /api/students` - Create new student (include parent array in body)
- `PUT /api/students/:id` - Update student info

### Communications
- `POST /api/communications` - Log an interaction (student_id, communication_type, message)

### Tasks
- `POST /api/tasks` - Create task (student_id, task_title, description, due_date)
- `PUT /api/tasks/:id` - Update task status

### Metadata
- `GET /api/batches` - Get all unique batch values for filtering
- `GET /api/stats` - Get dashboard stats (total students, by status, top 5 batches)

## Development Notes

### Code Patterns
- **API Calls**: Backend uses synchronous db functions (not promises/callbacks). sql.js runs entirely in-process and is synchronous.
- **Frontend State**: React components use useState for local state; API calls via axios from api.js
- **Database Access**: Use `query()`, `queryOne()`, `run()` (not db.all/get/run) with parameterized queries (? placeholders) to prevent SQL injection
- **Error Handling**: Backend wraps endpoints in try-catch; returns JSON with error messages or 500 status

### Important Implementation Details
- **sql.js behavior**: Database runs entirely in memory (loaded from `crm.db` file). Changes are persisted back to the file but there's no transaction journal—be careful with concurrent writes.
- Search queries use LIKE with wildcards on name and email fields
- Pagination defaults to 50 students per page with limit/offset parameters
- Foreign keys have ON DELETE CASCADE for data integrity
- Status field on students defaults to 'prospect'
- Backend helper functions (`query`, `queryOne`, `run`) are synchronous—sql.js has no async operations

### Linting
ESLint is configured for the frontend only (eslint.config.js). Run `npm run lint` to check for issues. Backend has no linting configured.

### Database Reset
To clear the database during development:
1. Stop the backend server
2. Delete `crm-app/backend/crm.db`
3. Restart the backend—it will recreate an empty database with fresh schema

## Data Import Workflow

1. Update Excel file: `MoharData/Contact Information.xlsx`
2. Run import: `cd crm-app/backend && npm run import`
3. This reads the Excel and populates the SQLite database
4. The import script creates students, parents, and initial communications as needed

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite 8, Axios, react-icons, ESLint |
| **Backend** | Node.js, Express 5, body-parser, cors, sql.js |
| **Database** | sql.js (JavaScript SQLite—loads crm.db into memory) |
| **Build** | Vite (frontend), CommonJS modules (backend) |

## Common Workflows

**Adding a new student field:**
1. Update schema in db.js (ALTER TABLE or schema version)
2. Add input in StudentDetail.jsx form
3. Update POST/PUT endpoints in server.js
4. Update importData.js if importing from Excel

**Modifying API behavior:**
- Edit endpoints in server.js directly (no routing library, all inline)
- Remember to handle both search + filter combinations in GET /api/students (see query building logic)

**Frontend styling updates:**
- Global: App.css (most component styles live here)
- Global defaults: index.css
- Components are styled inline or via App.css classes

## Deployment

**Current Status:** Local development only (http://localhost:5000 and http://localhost:5173)

### Quick Deployment with Render (Recommended)

Render is the simplest option—one platform for backend + frontend, free tier available, auto-deploys from GitHub.

**Steps:**
1. Create Render account (https://render.com)
2. Connect GitHub repository
3. Create Backend Web Service (Node.js)
4. Add persistent disk for `crm.db` (critical for sql.js)
5. Create Frontend Static Site
6. Set environment variables for API URL
7. Deploy—auto-redeploys on git push

**Important:** Since sql.js loads the database into memory, you MUST:
- Configure persistent disk in Render
- Implement regular backups of `crm.db`
- Test database changes persist across restarts

### Other Deployment Options

- **Railway:** $7-20/month (very similar to Render)
- **Vercel (Frontend Only):** Free + Railway backend ($7-20/month)
- **Heroku:** $7/month (less reliable, similar setup)
- **DigitalOcean:** $4-12/month (more control, harder setup)
- **AWS:** $10-100+/month (enterprise scale)

### Render Deployment (Recommended)

**Key Points for Render:**
1. Backend runs as Web Service on `/opt/render/project/src/crm-app/backend`
2. **CRITICAL:** Must add persistent disk at mount path `/app` (or service will lose data on restart)
3. Logs show "Creating new database" = disk not configured or file not found
4. To import data: `node bulk-import.js` (uploads 130 students in ~1 minute)
5. Free tier has ~30s cold starts; upgrade to Starter for better performance

**Troubleshooting Render:**
- Empty API responses? Check Render Logs for "Creating new database"
- If so, add/verify persistent disk in Render dashboard
- Upload local data: `node upload-to-render.js` then `node bulk-import.js`
- See RENDER_TROUBLESHOOT.md for detailed debugging

### Deployment Guides

**See DEPLOY_RENDER.md for:**
- Complete step-by-step Render setup (both backend and frontend)
- Backend Web Service configuration
- Frontend Static Site configuration
- Database persistence with Render disks
- Backup strategies
- Monitoring and logs
- Troubleshooting
- Advanced SPA routing solutions

**Alternative:** DEPLOY_RAILWAY_VERCEL.md for Railway + Vercel setup

## Troubleshooting

### Local Development

**Backend won't start:**
- Check if port 5000 is already in use: `netstat -ano | findstr :5000` (Windows)
- Kill process: `taskkill /PID [PID] /F`
- Or use different port: modify PORT in server.js

**Frontend won't compile:**
- Clear node_modules: `rm -r crm-app/frontend/node_modules && npm install`
- Clear Vite cache: `rm -r crm-app/frontend/.vite`
- Check Node version: `node --version` (needs v16+)

**No students showing locally:**
- Check if data was imported: `npm run import` in backend directory
- Verify Excel file exists: `MoharData/Contact Information.xlsx`
- Check crm.db file size: should be >100KB if data imported

### Render Deployment

**API returns empty student list:**
- Check Render logs for "Creating new database" message
- If present: persistent disk not configured
- Solution: Add disk in Render dashboard with mount path `/app`

**Data uploaded but then disappears:**
- Persistent disk not properly mounted
- Verify disk configuration: Dashboard → Disks → Mount path should be `/app`
- Redeploy service after adding disk

**Import script fails:**
- Verify backend is running: `curl https://your-render-url.onrender.com/api/students`
- Check network connectivity
- Run: `node bulk-import.js` from MoharCRM root directory

**Frontend shows 404 on page refresh:**
- Static site has SPA routing issue
- Solution: Serve frontend from backend instead (documented in DEPLOY_RENDER.md)
- Or configure rewrites in Render settings

### Database Issues

**sql.js behavior (critical for Render):**
- Loads entire `crm.db` into memory on startup
- Changes written back to disk after each operation
- Without persistent disk, all data lost on service restart
- No transaction journal; concurrent writes can cause corruption

**Database corrupted:**
- Restore from backup: `render download --service name --path /app/crm-app/backend/crm.db`
- Or rebuild from Excel: `npm run import`
- Or recreate via API: `node bulk-import.js` with students-backup.json

## Future Considerations

From the README, planned features include: user authentication, bulk operations, file uploads, advanced reporting, and mobile integration. Keep architecture flexible for adding middleware and auth layers.

Long-term scaling: Plan to migrate from SQLite to PostgreSQL when database grows beyond in-memory limits.

**Immediate improvements suggested:**
1. Add transactional integrity for concurrent writes
2. Implement automated backups (daily to S3 or similar)
3. Add read-only replicas for scaling reads
4. Migrate to PostgreSQL for production use cases
