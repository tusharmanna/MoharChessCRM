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

Available npm scripts:
- `npm run dev` - Start Vite development server
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

### Backend Structure (`crm-app/backend/`)

**Core Files:**
- `server.js` - Express API server with all REST endpoints (~226 lines)
  - CORS enabled for frontend communication
  - Body-parser for JSON parsing
  - RESTful endpoints for students, communications, tasks, metadata
  
- `db.js` - SQLite database initialization and schema (~61 lines)
  - Creates 4 tables on startup: students, parents, communications, tasks
  - Handles database connection and table creation
  
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

**students** table:
- id (auto-increment)
- first_name, last_name
- email (unique), age
- chess_experience (experience level)
- batch (class/group assignment)
- status (prospect|enrolled|active|alumni)
- notes (free-form text)
- created_at, updated_at (timestamps)

**parents** table:
- id, student_id (FK)
- parent_name, phone_number
- relation (default: 'parent')
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
- created_at

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
- **API Calls**: Backend uses callbacks with sqlite3 (not promises). Multiple nested callbacks are common in server.js.
- **Frontend State**: React components use useState for local state; API calls via axios from api.js
- **Database Access**: Use db.get(), db.all(), db.run() with parameterized queries (? placeholders) to prevent SQL injection

### Important Implementation Details
- SQLite uses `AUTOINCREMENT` for IDs but will reuse IDs after delete without it—current schema is safe
- Search queries use LIKE with wildcards on name and email fields
- Pagination defaults to 50 students per page with limit/offset parameters
- Foreign keys have ON DELETE CASCADE for data integrity
- Status field on students defaults to 'prospect'

### Linting
ESLint is configured for the frontend (eslint.config.js). Run `npm run lint` to check for issues.

## Data Import Workflow

1. Update Excel file: `MoharData/Contact Information.xlsx`
2. Run import: `cd crm-app/backend && npm run import`
3. This reads the Excel and populates the SQLite database
4. The import script creates students, parents, and initial communications as needed

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite 8, Axios, react-icons, ESLint |
| **Backend** | Node.js, Express 5, body-parser, cors |
| **Database** | SQLite3 |
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

## Future Considerations

From the README, planned features include: user authentication, bulk operations, file uploads, advanced reporting, and mobile integration. Keep architecture flexible for adding middleware and auth layers.
