#!/usr/bin/env node

/**
 * Bulk import students from backup JSON to Render backend
 * Usage: node bulk-import.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RENDER_URL = 'https://moharchesscrm.onrender.com';
const BACKUP_FILE = path.join(__dirname, 'students-backup.json');

console.log('📥 Bulk Import Students to Render');
console.log('==================================\n');

// Check if backup file exists
if (!fs.existsSync(BACKUP_FILE)) {
  console.error('❌ Error: students-backup.json not found');
  console.log('\nFirst run: node upload-to-render.js');
  process.exit(1);
}

// Read backup data
const data = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
console.log(`✓ Found backup with ${data.count} students\n`);

let imported = 0;
let failed = 0;
let skipped = 0;

// Helper to make HTTPS POST request
function postStudent(student) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      first_name: student.first_name || 'Unknown',
      last_name: student.last_name || 'Student',
      email: student.email || `student-${Date.now()}@example.com`,
      age: student.age,
      chess_experience: student.chess_experience || 'beginner',
      batch: student.batch || 'Imported',
      notes: student.notes,
      status: student.status || 'prospect'
    });

    const url = new URL(`${RENDER_URL}/api/students`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

// Import students sequentially with delays
async function importStudents() {
  console.log(`Starting import of ${data.students.length} students...\n`);

  for (let i = 0; i < data.students.length; i++) {
    const student = data.students[i];

    // Skip if no first name
    if (!student.first_name || student.first_name === 'Unknown') {
      skipped++;
      continue;
    }

    try {
      await postStudent(student);
      imported++;

      // Show progress every 10 students
      if ((i + 1) % 10 === 0) {
        console.log(`  Imported ${i + 1}/${data.students.length}...`);
      }

      // Add delay to avoid rate limiting (50ms between requests)
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed to import ${student.first_name} ${student.last_name}:`, err.message);
    }
  }
}

// Main execution
importStudents().then(() => {
  console.log('\n==================================');
  console.log('✓ Import Complete!');
  console.log(`  ✓ Imported: ${imported}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`  ⊘ Skipped: ${skipped}`);
  console.log('==================================\n');

  console.log('Verifying import...');
  const verifyUrl = new URL(`${RENDER_URL}/api/students`);

  https.get(verifyUrl, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        console.log(`✓ Verification successful!`);
        console.log(`  Total students in Render: ${result.total}`);
        console.log(`  Expected: ${imported}`);
        console.log(`\n✓ You can now access your students at:`);
        console.log(`  ${RENDER_URL}\n`);
      } catch (err) {
        console.log('Could not verify - API may still be initializing');
      }
    });
  }).on('error', err => {
    console.error('Verification failed:', err.message);
  });
}).catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
