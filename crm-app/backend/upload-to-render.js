const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function exportData() {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'crm.db');

    if (!fs.existsSync(dbPath)) {
      console.error('❌ crm.db not found at:', dbPath);
      process.exit(1);
    }

    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);

    // Get all students
    const result = db.exec('SELECT * FROM students');
    if (result.length === 0) {
      console.log('⚠️  No data in database');
      process.exit(0);
    }

    const columns = result[0].columns;
    const values = result[0].values;

    const students = values.map(row => {
      const student = {};
      columns.forEach((col, idx) => {
        student[col] = row[idx];
      });
      return student;
    });

    const backup = {
      timestamp: new Date().toISOString(),
      totalCount: students.length,
      students
    };

    const outputPath = path.join(__dirname, 'students-backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));

    console.log(`✓ Exported ${students.length} students to students-backup.json`);
    console.log(`✓ File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('Export error:', err.message);
    process.exit(1);
  }
}

exportData();
