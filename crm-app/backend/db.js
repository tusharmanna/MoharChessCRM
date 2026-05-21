const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Students table
db.exec(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  age TEXT,
  chess_experience TEXT,
  batch TEXT,
  status TEXT DEFAULT 'prospect',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// Parents table
db.exec(`CREATE TABLE IF NOT EXISTS parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  parent_name TEXT NOT NULL,
  phone_number TEXT,
  relation TEXT DEFAULT 'parent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)`);

// Communications log
db.exec(`CREATE TABLE IF NOT EXISTS communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  communication_type TEXT,
  message TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT 'system',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)`);

// Tasks/Follow-ups
db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  task_title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)`);

console.log('Connected to SQLite database');

module.exports = db;
