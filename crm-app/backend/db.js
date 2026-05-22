const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use persistent disk location in production (Render), local in development
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'crm.db');
console.log(`Database path: ${dbPath}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`Loading existing database: ${dbPath} (${stats.size} bytes)`);
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
      console.log('Database loaded successfully');
    } else {
      console.log(`Creating new database at: ${dbPath}`);
      db = new SQL.Database();
    }
  } catch (err) {
    console.error('DB load error:', err);
    console.error('Stack:', err.stack);
    db = new SQL.Database();
  }

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    age TEXT,
    chess_experience TEXT,
    batch TEXT,
    status TEXT DEFAULT 'prospect',
    notes TEXT,
    source_of_lead TEXT,
    enrollment_date DATE,
    last_activity_date DATE,
    student_rating INTEGER,
    chess_rating REAL,
    payment_status TEXT DEFAULT 'pending',
    risk_score TEXT DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    parent_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    relation TEXT DEFAULT 'parent',
    communication_preference TEXT DEFAULT 'email',
    best_contact_time TEXT DEFAULT 'evening',
    communication_frequency TEXT DEFAULT 'monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    communication_type TEXT,
    message TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    task_title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  // Pipeline stages table (for prospect tracking)
  db.run(`CREATE TABLE IF NOT EXISTS pipeline_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    stage TEXT NOT NULL,
    days_in_stage INTEGER DEFAULT 0,
    expected_enrollment_date DATE,
    loss_reason TEXT,
    stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  // Progress tracking table
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    attendance_rate REAL,
    skill_level TEXT,
    internal_rating REAL,
    parent_satisfaction INTEGER,
    months_enrolled INTEGER,
    strengths TEXT,
    areas_to_improve TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  // Lead scoring table
  db.run(`CREATE TABLE IF NOT EXISTS lead_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    interest_level INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    chess_experience_score INTEGER DEFAULT 0,
    demographic_fit INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'low',
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`);

  console.log('Connected to SQLite database (sql.js)');
}

function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    if (results.length === 0 && sql.includes('SELECT')) {
      console.log(`Query returned 0 results: ${sql.substring(0, 100)}`);
    }
    return results;
  } catch (err) {
    console.error('Query error:', err, 'SQL:', sql.substring(0, 200));
    return [];
  }
}

function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results[0] || null;
}

function run(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified(), lastID: 0 };
  } catch (err) {
    console.error('Run error:', err, sql);
    throw err;
  }
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  run,
  db: () => db,
  close: () => saveDatabase()
};
