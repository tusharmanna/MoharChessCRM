const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase, query, queryOne, run } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize database and start server
initDatabase().then(() => {
  // GET all students with search and filter
  app.get('/api/students', (req, res) => {
    try {
      const { search, batch, status, limit = 50, offset = 0 } = req.query;

      let whereClause = `WHERE 1=1`;
      const params = [];

      if (search) {
        whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (batch && batch !== 'all') {
        whereClause += ` AND batch = ?`;
        params.push(batch);
      }

      if (status && status !== 'all') {
        whereClause += ` AND status = ?`;
        params.push(status);
      }

      // Get count
      const countRow = queryOne(`SELECT COUNT(*) as count FROM students ${whereClause}`, params);
      const total = countRow?.count || 0;

      // Get students
      const students = query(
        `SELECT * FROM students ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
      );

      res.json({
        students,
        total,
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

      const student = queryOne(`SELECT * FROM students WHERE id = ?`, [id]);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const parents = query(`SELECT * FROM parents WHERE student_id = ?`, [id]);
      const communications = query(
        `SELECT * FROM communications WHERE student_id = ? ORDER BY date DESC`,
        [id]
      );
      const tasks = query(`SELECT * FROM tasks WHERE student_id = ? ORDER BY due_date ASC`, [id]);

      res.json({ student, parents, communications, tasks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE new student
  app.post('/api/students', (req, res) => {
    try {
      const { first_name, last_name, email, age, chess_experience, batch, notes, parents } =
        req.body;

      run(
        `INSERT INTO students
         (first_name, last_name, email, age, chess_experience, batch, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, age, chess_experience, batch || 'Unassigned', notes]
      );

      // Get the last inserted student
      const student = queryOne(`SELECT * FROM students WHERE email = ? ORDER BY id DESC LIMIT 1`, [
        email
      ]);
      const studentId = student?.id || 0;

      // Add parents if provided
      if (parents && Array.isArray(parents)) {
        parents.forEach((parent) => {
          run(
            `INSERT INTO parents (student_id, parent_name, phone_number)
             VALUES (?, ?, ?)`,
            [studentId, parent.parent_name, parent.phone_number]
          );
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

      run(
        `UPDATE students
         SET first_name=?, last_name=?, email=?, age=?, chess_experience=?, batch=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [first_name, last_name, email, age, chess_experience, batch, status, notes, id]
      );

      res.json({ message: 'Student updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ADD communication log
  app.post('/api/communications', (req, res) => {
    try {
      const { student_id, communication_type, message } = req.body;

      run(
        `INSERT INTO communications (student_id, communication_type, message, created_by)
         VALUES (?, ?, ?, ?)`,
        [student_id, communication_type, message, 'user']
      );

      res.json({ message: 'Communication logged' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE task
  app.post('/api/tasks', (req, res) => {
    try {
      const { student_id, task_title, description, due_date } = req.body;

      run(
        `INSERT INTO tasks (student_id, task_title, description, due_date)
         VALUES (?, ?, ?, ?)`,
        [student_id, task_title, description, due_date]
      );

      res.json({ message: 'Task created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE task status
  app.put('/api/tasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      run(`UPDATE tasks SET status=? WHERE id=?`, [status, id]);

      res.json({ message: 'Task updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET batches
  app.get('/api/batches', (req, res) => {
    try {
      const batches = query(`SELECT DISTINCT batch FROM students ORDER BY batch`);
      res.json(batches.map((b) => b.batch));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET statistics
  app.get('/api/stats', (req, res) => {
    try {
      const total = queryOne(`SELECT COUNT(*) as total FROM students`);
      const statuses = query(`SELECT status, COUNT(*) as count FROM students GROUP BY status`);
      const topBatches = query(
        `SELECT batch, COUNT(*) as count FROM students GROUP BY batch ORDER BY count DESC LIMIT 5`
      );

      res.json({
        total: total?.total || 0,
        byStatus: statuses,
        topBatches
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
