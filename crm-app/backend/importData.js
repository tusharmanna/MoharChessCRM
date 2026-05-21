const xlsx = require('xlsx');
const db = require('./db');
const path = require('path');

const excelPath = path.join(__dirname, '../../MoharData/Contact Information.xlsx');

function importData() {
  const workbook = xlsx.readFile(excelPath);
  const mainSheet = workbook.Sheets['Master Contact List 2025'];
  const data = xlsx.utils.sheet_to_json(mainSheet);

  console.log(`Found ${data.length} rows to import`);

  let count = 0;
  let completed = 0;

  data.forEach((row, index) => {
    const firstName = (row['First Name'] || '').trim();
    const lastName = (row['Last Name'] || '').trim();
    const email = (row['Email Address'] || '').trim() || null;
    const age = (row['Age'] || '').toString().trim();
    const chessExp = (row['Have you played chess before?'] || '').toString().trim();
    const batch = (row['Batch'] || 'Unassigned').trim();
    const notes = (row['Comments'] || '').toString().trim();

    if (!firstName) {
      completed++;
      return;
    }

    db.run(
      `INSERT OR IGNORE INTO students
       (first_name, last_name, email, age, chess_experience, batch, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, age, chessExp, batch, notes],
      function (err) {
        if (err) {
          console.error(`Error inserting ${firstName}:`, err.message);
          completed++;
          return;
        }

        const studentId = this.lastID;
        if (studentId > 0) count++;

        const parent1Name = (row['Parent 1 Name'] || '').trim();
        const parent1Phone = (row['Parent 1 Phone Number'] || '').toString().trim();
        if (parent1Name) {
          db.run(
            `INSERT INTO parents (student_id, parent_name, phone_number)
             VALUES (?, ?, ?)`,
            [studentId, parent1Name, parent1Phone]
          );
        }

        const parent2Name = (row['Parent 2 Name'] || '').trim();
        const parent2Phone = (row['Parent 2 Phone Number'] || '').toString().trim();
        if (parent2Name) {
          db.run(
            `INSERT INTO parents (student_id, parent_name, phone_number)
             VALUES (?, ?, ?)`,
            [studentId, parent2Name, parent2Phone]
          );
        }

        completed++;

        if (completed === data.length) {
          setTimeout(() => {
            console.log(`✓ Imported ${count} students successfully`);
            db.close();
          }, 500);
        }
      }
    );
  });
}

importData();
