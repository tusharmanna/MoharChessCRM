const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase, query, queryOne, run } = require('./db-supabase');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize database and start server
initDatabase().then(() => {
  // GET all students with search and filter
  app.get('/api/students', async (req, res) => {
    try {
      const { search, batch, status, limit = 50, offset = 0 } = req.query;

      let whereClause = `WHERE 1=1`;
      const params = [];
      let paramCount = 1;

      if (search) {
        const searchTerm = `%${search}%`;
        whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount + 1} OR email ILIKE $${paramCount + 2})`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramCount += 3;
      }

      if (batch && batch !== 'all') {
        whereClause += ` AND batch = $${paramCount}`;
        params.push(batch);
        paramCount += 1;
      }

      if (status && status !== 'all') {
        whereClause += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount += 1;
      }

      // Get count
      const countRow = await queryOne(`SELECT COUNT(*) as count FROM students ${whereClause}`, params);
      const total = countRow?.count || 0;

      // Get students
      const students = await query(
        `SELECT * FROM students ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
  app.get('/api/students/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const student = await queryOne(`SELECT * FROM students WHERE id = $1`, [id]);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const parents = await query(`SELECT * FROM parents WHERE student_id = $1`, [id]);
      const communications = await query(
        `SELECT * FROM communications WHERE student_id = $1 ORDER BY date DESC`,
        [id]
      );
      const tasks = await query(`SELECT * FROM tasks WHERE student_id = $1 ORDER BY due_date ASC`, [id]);

      res.json({ student, parents, communications, tasks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE new student
  app.post('/api/students', async (req, res) => {
    try {
      const { first_name, last_name, email, age, chess_experience, batch, notes, parents } =
        req.body;

      const result = await run(
        `INSERT INTO students
         (first_name, last_name, email, age, chess_experience, batch, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [first_name, last_name, email, age, chess_experience, batch || 'Unassigned', notes]
      );

      const studentId = result.lastID || result[0]?.id || 0;

      // Add parents if provided
      if (parents && Array.isArray(parents)) {
        for (const parent of parents) {
          await run(
            `INSERT INTO parents (student_id, parent_name, phone_number)
             VALUES ($1, $2, $3)`,
            [studentId, parent.parent_name, parent.phone_number]
          );
        }
      }

      res.json({ id: studentId, message: 'Student created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE student
  app.put('/api/students/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, age, chess_experience, batch, status, notes } =
        req.body;

      await run(
        `UPDATE students
         SET first_name=$1, last_name=$2, email=$3, age=$4, chess_experience=$5, batch=$6, status=$7, notes=$8, updated_at=CURRENT_TIMESTAMP
         WHERE id=$9`,
        [first_name, last_name, email, age, chess_experience, batch, status, notes, id]
      );

      res.json({ message: 'Student updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ADD communication log
  app.post('/api/communications', async (req, res) => {
    try {
      const { student_id, communication_type, message } = req.body;

      await run(
        `INSERT INTO communications (student_id, communication_type, message, created_by)
         VALUES ($1, $2, $3, $4)`,
        [student_id, communication_type, message, 'user']
      );

      res.json({ message: 'Communication logged' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE task
  app.post('/api/tasks', async (req, res) => {
    try {
      const { student_id, task_title, description, due_date } = req.body;

      await run(
        `INSERT INTO tasks (student_id, task_title, description, due_date)
         VALUES ($1, $2, $3, $4)`,
        [student_id, task_title, description, due_date]
      );

      res.json({ message: 'Task created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE task status
  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await run(`UPDATE tasks SET status=$1 WHERE id=$2`, [status, id]);

      res.json({ message: 'Task updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET batches
  app.get('/api/batches', async (req, res) => {
    try {
      const batches = await query(`SELECT DISTINCT batch FROM students ORDER BY batch`);
      res.json(batches.map((b) => b.batch));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const total = await queryOne(`SELECT COUNT(*) as total FROM students`);
      const statuses = await query(`SELECT status, COUNT(*) as count FROM students GROUP BY status`);
      const topBatches = await query(
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
  app.post('/api/pipeline/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const { stage, expected_enrollment_date, loss_reason } = req.body;

      await run(
        `INSERT INTO pipeline_stages (student_id, stage, expected_enrollment_date, loss_reason)
         VALUES ($1, $2, $3, $4)`,
        [studentId, stage, expected_enrollment_date, loss_reason]
      );

      res.json({ message: 'Pipeline stage updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/pipeline/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const pipeline = await queryOne(
        `SELECT * FROM pipeline_stages WHERE student_id = $1 ORDER BY stage_updated_at DESC LIMIT 1`,
        [studentId]
      );
      res.json(pipeline || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Lead Scoring
  app.post('/api/lead-score/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const { interest_level, engagement_score, chess_experience_score, demographic_fit } = req.body;

      const total_score = interest_level + engagement_score + chess_experience_score + demographic_fit;
      let priority = 'low';
      if (total_score >= 7) priority = 'hot';
      else if (total_score >= 4) priority = 'medium';

      await run(
        `INSERT INTO lead_scores
         (student_id, interest_level, engagement_score, chess_experience_score, demographic_fit, total_score, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (student_id) DO UPDATE SET
           interest_level = $2,
           engagement_score = $3,
           chess_experience_score = $4,
           demographic_fit = $5,
           total_score = $6,
           priority = $7`,
        [studentId, interest_level, engagement_score, chess_experience_score, demographic_fit, total_score, priority]
      );

      res.json({ score: total_score, priority });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/lead-score/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const score = await queryOne(`SELECT * FROM lead_scores WHERE student_id = $1`, [studentId]);
      res.json(score || { total_score: 0, priority: 'low' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Student Progress
  app.post('/api/progress/:studentId', async (req, res) => {
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

      await run(
        `INSERT INTO progress
         (student_id, attendance_rate, skill_level, internal_rating, parent_satisfaction, months_enrolled, strengths, areas_to_improve)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (student_id) DO UPDATE SET
           attendance_rate = $2,
           skill_level = $3,
           internal_rating = $4,
           parent_satisfaction = $5,
           months_enrolled = $6,
           strengths = $7,
           areas_to_improve = $8`,
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

  app.get('/api/progress/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const progress = await queryOne(`SELECT * FROM progress WHERE student_id = $1`, [studentId]);
      res.json(progress || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Parent Preferences
  app.put('/api/parents/:parentId/preferences', async (req, res) => {
    try {
      const { parentId } = req.params;
      const { communication_preference, best_contact_time, communication_frequency } = req.body;

      await run(
        `UPDATE parents
         SET communication_preference=$1, best_contact_time=$2, communication_frequency=$3
         WHERE id=$4`,
        [communication_preference, best_contact_time, communication_frequency, parentId]
      );

      res.json({ message: 'Parent preferences updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hot Leads - Get prospects needing attention
  app.get('/api/hot-leads', async (req, res) => {
    try {
      const hotLeads = await query(
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
  app.get('/api/at-risk-students', async (req, res) => {
    try {
      const atRisk = await query(
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
  app.get('/api/crm-dashboard', async (req, res) => {
    try {
      const totalLeads = await queryOne(`SELECT COUNT(*) as count FROM students WHERE status = 'prospect'`);
      const enrolled = await queryOne(`SELECT COUNT(*) as count FROM students WHERE status = 'enrolled'`);
      const hotLeads = await queryOne(`SELECT COUNT(*) as count FROM lead_scores WHERE priority = 'hot'`);
      const atRisk = await queryOne(`SELECT COUNT(*) as count FROM progress WHERE attendance_rate < 0.75`);
      const avgConversion = await queryOne(
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

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
