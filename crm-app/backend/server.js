const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET all students with search and filter
app.get('/api/students', (req, res) => {
  const { search, batch, status, limit = 50, offset = 0 } = req.query;

  let query = `SELECT * FROM students WHERE 1=1`;
  const params = [];

  if (search) {
    query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (batch && batch !== 'all') {
    query += ` AND batch = ?`;
    params.push(batch);
  }

  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }

  // Get total count
  db.get(`SELECT COUNT(*) as count FROM students WHERE 1=1 ${
    search ? `AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)` : ''
  } ${batch && batch !== 'all' ? 'AND batch = ?' : ''} ${
    status && status !== 'all' ? 'AND status = ?' : ''
  }`, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, students) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        students,
        total: countRow.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    });
  });
});

// GET single student with parents and communications
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM students WHERE id = ?`, [id], (err, student) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Get parents
    db.all(`SELECT * FROM parents WHERE student_id = ?`, [id], (err, parents) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get communications
      db.all(
        `SELECT * FROM communications WHERE student_id = ? ORDER BY date DESC`,
        [id],
        (err, communications) => {
          if (err) return res.status(500).json({ error: err.message });

          // Get tasks
          db.all(
            `SELECT * FROM tasks WHERE student_id = ? ORDER BY due_date ASC`,
            [id],
            (err, tasks) => {
              if (err) return res.status(500).json({ error: err.message });

              res.json({ student, parents, communications, tasks });
            }
          );
        }
      );
    });
  });
});

// CREATE new student
app.post('/api/students', (req, res) => {
  const {
    first_name,
    last_name,
    email,
    age,
    chess_experience,
    batch,
    notes,
    parents
  } = req.body;

  db.run(
    `INSERT INTO students
     (first_name, last_name, email, age, chess_experience, batch, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, age, chess_experience, batch || 'Unassigned', notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const studentId = this.lastID;

      // Add parents if provided
      if (parents && Array.isArray(parents)) {
        parents.forEach((parent) => {
          db.run(
            `INSERT INTO parents (student_id, parent_name, phone_number)
             VALUES (?, ?, ?)`,
            [studentId, parent.parent_name, parent.phone_number]
          );
        });
      }

      res.json({ id: studentId, message: 'Student created successfully' });
    }
  );
});

// UPDATE student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, age, chess_experience, batch, status, notes } =
    req.body;

  db.run(
    `UPDATE students
     SET first_name=?, last_name=?, email=?, age=?, chess_experience=?, batch=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`,
    [first_name, last_name, email, age, chess_experience, batch, status, notes, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// ADD communication log
app.post('/api/communications', (req, res) => {
  const { student_id, communication_type, message } = req.body;

  db.run(
    `INSERT INTO communications (student_id, communication_type, message, created_by)
     VALUES (?, ?, ?, ?)`,
    [student_id, communication_type, message, 'user'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Communication logged' });
    }
  );
});

// CREATE task
app.post('/api/tasks', (req, res) => {
  const { student_id, task_title, description, due_date } = req.body;

  db.run(
    `INSERT INTO tasks (student_id, task_title, description, due_date)
     VALUES (?, ?, ?, ?)`,
    [student_id, task_title, description, due_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Task created' });
    }
  );
});

// UPDATE task status
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE tasks SET status=? WHERE id=?`, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task updated' });
  });
});

// GET batches (for filter dropdown)
app.get('/api/batches', (req, res) => {
  db.all(`SELECT DISTINCT batch FROM students ORDER BY batch`, [], (err, batches) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(batches.map((b) => b.batch));
  });
});

// GET statistics
app.get('/api/stats', (req, res) => {
  db.get(`SELECT COUNT(*) as total FROM students`, [], (err, total) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(
      `SELECT status, COUNT(*) as count FROM students GROUP BY status`,
      [],
      (err, statuses) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(
          `SELECT batch, COUNT(*) as count FROM students GROUP BY batch ORDER BY count DESC LIMIT 5`,
          [],
          (err, batches) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ total: total.total, byStatus: statuses, topBatches: batches });
          }
        );
      }
    );
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
