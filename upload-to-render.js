#!/usr/bin/env node

/**
 * Prepare student backup from local database
 * Usage: node upload-to-render.js
 */

const fs = require('fs');
const path = require('path');

const LOCAL_DB_PATH = path.join(__dirname, 'crm-app/backend/crm.db');

console.log('📤 Preparing Student Backup');
console.log('================================\n');

// Check if local database exists
if (!fs.existsSync(LOCAL_DB_PATH)) {
  console.error('❌ Error: crm.db not found at:', LOCAL_DB_PATH);
  console.error('\nMake sure your backend is running with data');
  process.exit(1);
}

const stats = fs.statSync(LOCAL_DB_PATH);
console.log(`✓ Found local database: ${LOCAL_DB_PATH}`);
console.log(`  Size: ${stats.size} bytes`);
console.log(`  Modified: ${stats.mtime}\n`);

// Use the backend's sql.js to read the database
const backendPath = path.join(__dirname, 'crm-app/backend');
const sqlJsPath = path.join(backendPath, 'node_modules/sql.js');

try {
  const initSqlJs = require(sqlJsPath);

  initSqlJs().then(SQL => {
    try {
      const localDb = fs.readFileSync(LOCAL_DB_PATH);
      const db = new SQL.Database(localDb);

      // Get count of students
      const result = db.exec('SELECT COUNT(*) as count FROM students');
      const studentCount = result.length > 0 ? result[0].values[0][0] : 0;

      console.log(`✓ Local database contains: ${studentCount} students\n`);

      if (studentCount === 0) {
        console.warn('⚠️  Warning: Local database has no students');
        console.log('   The database is empty. No data to export.\n');
        process.exit(0);
      }

      // Get all students from local database
      const students = db.exec('SELECT * FROM students');

      if (students.length > 0) {
        const columns = students[0].columns;
        const values = students[0].values;

        console.log(`✓ Exporting ${values.length} students...\n`);

        // Save student data for bulk import
        const importData = {
          count: values.length,
          students: values.map(row => {
            const student = {};
            columns.forEach((col, idx) => {
              student[col] = row[idx];
            });
            return student;
          })
        };

        const backupPath = path.join(__dirname, 'students-backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(importData, null, 2));

        console.log('✓ Backup created: students-backup.json\n');
        console.log('================================');
        console.log('✓ Ready to import!');
        console.log('================================\n');
        console.log('Next step: Run this command\n');
        console.log('  node bulk-import.js\n');
        console.log('This will import all ' + values.length + ' students to Render\n');
      }

    } catch (err) {
      console.error('❌ Error reading database:', err.message);
      process.exit(1);
    }
  }).catch(err => {
    console.error('❌ Error initializing sql.js:', err.message);
    process.exit(1);
  });

} catch (err) {
  console.error('❌ Error: Could not load sql.js from backend');
  console.error('Make sure you have run: cd crm-app/backend && npm install\n');
  process.exit(1);
}
