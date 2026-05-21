# MoharCRM - Student Contact Management System

A modern CRM dashboard for managing student contacts, parent information, and communication logs.

## Quick Start

### Prerequisites
- Node.js 16+ (already installed ✓)
- npm (already installed ✓)

### Installation

```bash
# Backend setup
cd backend
npm install
npm run import  # Import Excel data

# Frontend setup
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend (Port 5000):**
```bash
cd backend
npm start
```

**Terminal 2 - Start Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

## Features

### Dashboard
- **Total Students**: View all student count
- **Student Status**: Breakdown by prospect, enrolled, active, alumni
- **Batch Distribution**: See students by class/group
- **Status Analytics**: Visual progress bars showing distribution

### Students Directory
- **Search**: Find students by name or email
- **Filter**: Filter by batch and status
- **Pagination**: Browse 50 students per page
- **Quick View**: Click any student for detailed view

### Student Detail Page
- **Personal Info**: Name, email, age, chess experience
- **Parent Contacts**: Phone numbers and parent names
- **Edit Profile**: Update student status and information
- **Communication Log**: Track all interactions
- **Notes System**: Add and view timestamped notes

## Data Structure

### Database Tables
- **students**: Student info (name, email, batch, status, chess experience)
- **parents**: Parent contact information linked to students
- **communications**: Log of all interactions (notes, calls, emails)
- **tasks**: Follow-up tasks and reminders

## Project Structure

```
crm-app/
├── backend/
│   ├── server.js          # Express API server
│   ├── db.js              # SQLite database setup
│   ├── importData.js      # Excel import script
│   └── crm.db             # SQLite database file
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app with navigation
│   │   ├── api.js         # API client utilities
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StudentList.jsx
│   │   │   └── StudentDetail.jsx
│   │   └── App.css        # Styling
│   └── vite.config.js     # Vite configuration
```

## API Endpoints

### Students
- `GET /api/students` - List all students with filters
- `GET /api/students/:id` - Get student with parents & communications
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student

### Communications
- `POST /api/communications` - Log a communication

### Tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update task status

### Metadata
- `GET /api/batches` - Get all batch names
- `GET /api/stats` - Get dashboard statistics

## Importing New Data

To re-import your Excel file:

```bash
cd backend
npm run import
```

Place your updated `Contact Information.xlsx` in `MoharData/` folder.

## Next Steps & Features to Add

1. **User Authentication** - Login system
2. **Bulk Operations** - Email/SMS campaigns
3. **File Uploads** - Store student documents
4. **Advanced Reporting** - Custom reports and exports
5. **Mobile App** - React Native version
6. **Integration** - Sync with Google Calendar, email providers

## Technology Stack

- **Frontend**: React 18, Vite, Axios, React Icons
- **Backend**: Node.js, Express, SQLite3
- **Styling**: CSS3 with gradients and animations
- **Database**: SQLite (can upgrade to PostgreSQL)

## Support

For issues or questions, check the API logs or browser console for error details.

---

**Built with ❤️ for MoharCRM**
