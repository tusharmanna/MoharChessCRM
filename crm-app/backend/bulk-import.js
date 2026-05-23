const fs = require('fs');
const path = require('path');
const https = require('https');

const RENDER_URL = 'https://moharchesscrm.onrender.com/api';
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 500;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function postStudent(student) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || null,
      age: student.age || null,
      chess_experience: student.chess_experience || 'beginner',
      batch: student.batch || 'Unassigned',
      notes: student.notes || ''
    });

    const url = new URL(`${RENDER_URL}/students`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function importData() {
  try {
    const backupPath = path.join(__dirname, 'students-backup.json');

    if (!fs.existsSync(backupPath)) {
      console.error('❌ students-backup.json not found. Run upload-to-render.js first');
      process.exit(1);
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const students = backup.students || [];

    console.log(`\n📤 Starting import of ${students.length} students...`);
    console.log(`🎯 Target: ${RENDER_URL}\n`);

    let imported = 0;
    let failed = 0;

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      const promises = batch.map(student => postStudent(student).catch(err => ({ error: err.message })));

      try {
        const results = await Promise.all(promises);

        results.forEach((result, idx) => {
          const studentNum = i + idx + 1;
          if (result.error) {
            console.log(`❌ Student ${studentNum}: ${result.error}`);
            failed++;
          } else {
            imported++;
            if (imported % 10 === 0) {
              process.stdout.write(`✓ ${imported}/${students.length}\r`);
            }
          }
        });
      } catch (err) {
        console.error(`\n⚠️  Batch error: ${err.message}`);
        failed += batch.length;
      }

      if (i + BATCH_SIZE < students.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log(`\n\n✅ Import complete!`);
    console.log(`   ✓ Imported: ${imported}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${imported + failed}/${students.length}`);
  } catch (err) {
    console.error('Import error:', err.message);
    process.exit(1);
  }
}

importData();
