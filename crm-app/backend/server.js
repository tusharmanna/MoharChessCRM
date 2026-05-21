const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET all students with search and filter
app.get('/api/students', (req, res) => {
  try {
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
    const countQuery = `SELECT COUNT(*) as count FROM students WHERE 1=1 ${
      search ? `AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)` : ''
    } ${batch && batch !== 'all' ? 'AND batch = ?' : ''} ${
      status && status !== 'all' ? 'AND status = ?' : ''
    }`;

    const countStmt = db.prepare(countQuery);
    const countRow = countStmt.get(...params);

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const stmt = db.prepare(query);
    const students = stmt.all(...params);

    res.json({
      students,
      total: countRow.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student with parents and communications
app.get('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;

    const studentStmt = db.prepare(`SELECT * FROM students WHERE id = ?`);
    const student = studentStmt.get(id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const parentsStmt = db.prepare(`SELECT * FROM parents WHERE student_id = ?`);
    const parents = parentsStmt.all(id);

    const commStmt = db.prepare(
      `SELECT * FROM communications WHERE student_id = ? ORDER BY date DESC`
    );
    const communications = commStmt.all(id);

    const tasksStmt = db.prepare(
      `SELECT * FROM tasks WHERE student_id = ? ORDER BY due_date ASC`
    );
    const tasks = tasksStmt.all(id);

    res.json({ student, parents, communications, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new student
app.post('/api/students', (req, res) => {
  try {
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

    const insertStmt = db.prepare(
      `INSERT INTO students
       (first_name, last_name, email, age, chess_experience, batch, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const result = insertStmt.run(
      first_name,
      last_name,
      email,
      age,
      chess_experience,
      batch || 'Unassigned',
      notes
    );

    const studentId = result.lastID;

    // Add parents if provided
    if (parents && Array.isArray(parents)) {
      const parentStmt = db.prepare(
        `INSERT INTO parents (student_id, parent_name, phone_number)
         VALUES (?, ?, ?)`
      );

      parents.forEach((parent) => {
        parentStmt.run(studentId, parent.parent_name, parent.phone_number);
      });
    }

    res.json({ id: studentId, message: 'Student created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE student
app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, age, chess_experience, batch, status, notes } =
      req.body;

    const updateStmt = db.prepare(
      `UPDATE students
       SET first_name=?, last_name=?, email=?, age=?, chess_experience=?, batch=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`
    );

    updateStmt.run(first_name, last_name, email, age, chess_experience, batch, status, notes, id);

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD communication log
app.post('/api/communications', (req, res) => {
  try {
    const { student_id, communication_type, message } = req.body;

    const insertStmt = db.prepare(
      `INSERT INTO communications (student_id, communication_type, message, created_by)
       VALUES (?, ?, ?, ?)`
    );

    const result = insertStmt.run(student_id, communication_type, message, 'user');

    res.json({ id: result.lastID, message: 'Communication logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
app.post('/api/tasks', (req, res) => {
  try {
    const { student_id, task_title, description, due_date } = req.body;

    const insertStmt = db.prepare(
      `INSERT INTO tasks (student_id, task_title, description, due_date)
       VALUES (?, ?, ?, ?)`
    );

    const result = insertStmt.run(student_id, task_title, description, due_date);

    res.json({ id: result.lastID, message: 'Task created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task status
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateStmt = db.prepare(`UPDATE tasks SET status=? WHERE id=?`);
    updateStmt.run(status, id);

    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET batches (for filter dropdown)
app.get('/api/batches', (req, res) => {
  try {
    const stmt = db.prepare(`SELECT DISTINCT batch FROM students ORDER BY batch`);
    const batches = stmt.all();

    res.json(batches.map((b) => b.batch));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statistics
app.get('/api/stats', (req, res) => {
  try {
    const totalStmt = db.prepare(`SELECT COUNT(*) as total FROM students`);
    const total = totalStmt.get();

    const statusStmt = db.prepare(
      `SELECT status, COUNT(*) as count FROM students GROUP BY status`
    );
    const statuses = statusStmt.all();

    const batchStmt = db.prepare(
      `SELECT batch, COUNT(*) as count FROM students GROUP BY batch ORDER BY count DESC LIMIT 5`
    );
    const batches = batchStmt.all();

    res.json({ total: total.total, byStatus: statuses, topBatches: batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
