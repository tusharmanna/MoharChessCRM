const xlsx = require('xlsx');
const db = require('./db');
const path = require('path');

const excelPath = path.join(__dirname, '../../MoharData/Contact Information.xlsx');

function importData() {
  try {
    const workbook = xlsx.readFile(excelPath);
    const mainSheet = workbook.Sheets['Master Contact List 2025'];
    const data = xlsx.utils.sheet_to_json(mainSheet);

    console.log(`Found ${data.length} rows to import`);

    const studentStmt = db.prepare(
      `INSERT OR IGNORE INTO students
       (first_name, last_name, email, age, chess_experience, batch, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const parentStmt = db.prepare(
      `INSERT INTO parents (student_id, parent_name, phone_number)
       VALUES (?, ?, ?)`
    );

    let count = 0;

    data.forEach((row) => {
      const firstName = (row['First Name'] || '').trim();
      const lastName = (row['Last Name'] || '').trim();
      const email = (row['Email Address'] || '').trim() || null;
      const age = (row['Age'] || '').toString().trim();
      const chessExp = (row['Have you played chess before?'] || '').toString().trim();
      const batch = (row['Batch'] || 'Unassigned').trim();
      const notes = (row['Comments'] || '').toString().trim();

      if (!firstName) return;

      try {
        const result = studentStmt.run(firstName, lastName, email, age, chessExp, batch, notes);
        const studentId = result.lastInsertRowid;

        if (studentId > 0) count++;

        const parent1Name = (row['Parent 1 Name'] || '').trim();
        const parent1Phone = (row['Parent 1 Phone Number'] || '').toString().trim();
        if (parent1Name) {
          parentStmt.run(studentId, parent1Name, parent1Phone);
        }

        const parent2Name = (row['Parent 2 Name'] || '').trim();
        const parent2Phone = (row['Parent 2 Phone Number'] || '').toString().trim();
        if (parent2Name) {
          parentStmt.run(studentId, parent2Name, parent2Phone);
        }
      } catch (err) {
        console.error(`Error inserting ${firstName}:`, err.message);
      }
    });

    console.log(`✓ Imported ${count} students successfully`);
    db.close();
  } catch (err) {
    console.error('Import error:', err.message);
    db.close();
  }
}

importData();
