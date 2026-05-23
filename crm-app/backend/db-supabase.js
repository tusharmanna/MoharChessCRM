const { Client } = require('pg');

let client;

async function initDatabase() {
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✓ Connected to Supabase PostgreSQL');

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
    )`,
    `CREATE TABLE IF NOT EXISTS parents (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
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
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      communication_type VARCHAR(255),
      message TEXT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(255) DEFAULT 'system',
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      task_title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date DATE,
      status VARCHAR(255) DEFAULT 'pending',
      priority VARCHAR(255) DEFAULT 'medium',
      assigned_to VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS pipeline_stages (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      stage VARCHAR(255) NOT NULL,
      days_in_stage INTEGER DEFAULT 0,
      expected_enrollment_date DATE,
      loss_reason VARCHAR(255),
      stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      stage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      attendance_rate FLOAT,
      skill_level VARCHAR(255),
      internal_rating FLOAT,
      parent_satisfaction INTEGER,
      months_enrolled INTEGER,
      strengths TEXT,
      areas_to_improve TEXT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS lead_scores (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      interest_level INTEGER DEFAULT 0,
      engagement_score INTEGER DEFAULT 0,
      chess_experience_score INTEGER DEFAULT 0,
      demographic_fit INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      priority VARCHAR(255) DEFAULT 'low',
      last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of tables) {
    try {
      await client.query(sql);
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
    const result = await client.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err.message);
    console.error('SQL:', sql);
    return [];
  }
}

async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

async function run(sql, params = []) {
  try {
    const result = await client.query(sql, params);
    return { changes: result.rowCount, lastID: result.rows[0]?.id || 0 };
  } catch (err) {
    console.error('Run error:', err.message);
    throw err;
  }
}

async function close() {
  try {
    await client.end();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database:', err.message);
  }
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  run,
  close
};
