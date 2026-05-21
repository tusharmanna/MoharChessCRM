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

  // ===== CRM FEATURES =====

  // Pipeline Stages - Track prospect journey
  app.post('/api/pipeline/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const { stage, expected_enrollment_date, loss_reason } = req.body;

      run(
        `INSERT INTO pipeline_stages (student_id, stage, expected_enrollment_date, loss_reason)
         VALUES (?, ?, ?, ?)`,
        [studentId, stage, expected_enrollment_date, loss_reason]
      );

      res.json({ message: 'Pipeline stage updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/pipeline/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const pipeline = queryOne(
        `SELECT * FROM pipeline_stages WHERE student_id = ? ORDER BY stage_updated_at DESC LIMIT 1`,
        [studentId]
      );
      res.json(pipeline || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Lead Scoring
  app.post('/api/lead-score/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const { interest_level, engagement_score, chess_experience_score, demographic_fit } = req.body;

      const total_score = interest_level + engagement_score + chess_experience_score + demographic_fit;
      let priority = 'low';
      if (total_score >= 7) priority = 'hot';
      else if (total_score >= 4) priority = 'medium';

      run(
        `INSERT OR REPLACE INTO lead_scores
         (student_id, interest_level, engagement_score, chess_experience_score, demographic_fit, total_score, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, interest_level, engagement_score, chess_experience_score, demographic_fit, total_score, priority]
      );

      res.json({ score: total_score, priority });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/lead-score/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const score = queryOne(`SELECT * FROM lead_scores WHERE student_id = ?`, [studentId]);
      res.json(score || { total_score: 0, priority: 'low' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Student Progress
  app.post('/api/progress/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const {
        attendance_rate,
        skill_level,
        internal_rating,
        parent_satisfaction,
        months_enrolled,
        strengths,
        areas_to_improve
      } = req.body;

      run(
        `INSERT OR REPLACE INTO progress
         (student_id, attendance_rate, skill_level, internal_rating, parent_satisfaction, months_enrolled, strengths, areas_to_improve)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          attendance_rate,
          skill_level,
          internal_rating,
          parent_satisfaction,
          months_enrolled,
          strengths,
          areas_to_improve
        ]
      );

      res.json({ message: 'Progress updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/progress/:studentId', (req, res) => {
    try {
      const { studentId } = req.params;
      const progress = queryOne(`SELECT * FROM progress WHERE student_id = ?`, [studentId]);
      res.json(progress || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Parent Preferences
  app.put('/api/parents/:parentId/preferences', (req, res) => {
    try {
      const { parentId } = req.params;
      const { communication_preference, best_contact_time, communication_frequency } = req.body;

      run(
        `UPDATE parents
         SET communication_preference=?, best_contact_time=?, communication_frequency=?
         WHERE id=?`,
        [communication_preference, best_contact_time, communication_frequency, parentId]
      );

      res.json({ message: 'Parent preferences updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hot Leads - Get prospects needing attention
  app.get('/api/hot-leads', (req, res) => {
    try {
      const hotLeads = query(
        `SELECT s.*, ls.total_score, ls.priority
         FROM students s
         LEFT JOIN lead_scores ls ON s.id = ls.student_id
         WHERE s.status = 'prospect' AND (ls.priority = 'hot' OR ls.total_score >= 7)
         ORDER BY ls.total_score DESC`
      );
      res.json(hotLeads);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // At-Risk Students
  app.get('/api/at-risk-students', (req, res) => {
    try {
      const atRisk = query(
        `SELECT s.*, p.attendance_rate, p.parent_satisfaction
         FROM students s
         LEFT JOIN progress p ON s.id = p.student_id
         WHERE s.status = 'enrolled' AND (p.attendance_rate < 0.75 OR p.parent_satisfaction < 3 OR s.risk_score = 'high')
         ORDER BY s.updated_at DESC`
      );
      res.json(atRisk);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CRM Dashboard Stats
  app.get('/api/crm-dashboard', (req, res) => {
    try {
      const totalLeads = queryOne(`SELECT COUNT(*) as count FROM students WHERE status = 'prospect'`);
      const enrolled = queryOne(`SELECT COUNT(*) as count FROM students WHERE status = 'enrolled'`);
      const hotLeads = queryOne(`SELECT COUNT(*) as count FROM lead_scores WHERE priority = 'hot'`);
      const atRisk = queryOne(`SELECT COUNT(*) as count FROM progress WHERE attendance_rate < 0.75`);
      const avgConversion = queryOne(
        `SELECT ROUND(COUNT(CASE WHEN status = 'enrolled' THEN 1 END) * 100.0 / COUNT(*), 2) as rate FROM students`
      );

      res.json({
        totalLeads: totalLeads?.count || 0,
        enrolled: enrolled?.count || 0,
        hotLeads: hotLeads?.count || 0,
        atRiskStudents: atRisk?.count || 0,
        conversionRate: avgConversion?.rate || 0
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
