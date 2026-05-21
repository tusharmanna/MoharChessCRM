const xlsx = require('xlsx');
const { initDatabase, run } = require('./db');
const path = require('path');

const excelPath = path.join(__dirname, '../../MoharData/Contact Information.xlsx');

async function importData() {
  try {
    await initDatabase();

    const workbook = xlsx.readFile(excelPath);
    const mainSheet = workbook.Sheets['Master Contact List 2025'];
    const data = xlsx.utils.sheet_to_json(mainSheet);

    console.log(`Found ${data.length} rows to import`);

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
        run(
          `INSERT OR IGNORE INTO students
           (first_name, last_name, email, age, chess_experience, batch, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [firstName, lastName, email, age, chessExp, batch, notes]
        );

        // Get student ID
        const student = require('./db').queryOne(
          `SELECT id FROM students WHERE email = ? ORDER BY id DESC LIMIT 1`,
          [email]
        );
        const studentId = student?.id;

        if (studentId) {
          count++;

          const parent1Name = (row['Parent 1 Name'] || '').trim();
          const parent1Phone = (row['Parent 1 Phone Number'] || '').toString().trim();
          if (parent1Name) {
            run(
              `INSERT INTO parents (student_id, parent_name, phone_number)
               VALUES (?, ?, ?)`,
              [studentId, parent1Name, parent1Phone]
            );
          }

          const parent2Name = (row['Parent 2 Name'] || '').trim();
          const parent2Phone = (row['Parent 2 Phone Number'] || '').toString().trim();
          if (parent2Name) {
            run(
              `INSERT INTO parents (student_id, parent_name, phone_number)
               VALUES (?, ?, ?)`,
              [studentId, parent2Name, parent2Phone]
            );
          }
        }
      } catch (err) {
        console.error(`Error inserting ${firstName}:`, err.message);
      }
    });

    console.log(`✓ Imported ${count} students successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Import error:', err.message);
    process.exit(1);
  }
}

importData();
