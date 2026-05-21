import { useEffect, useState } from 'react';
import { FiTrendingUp, FiEdit2, FiSave } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ProgressTracker() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students?limit=50&status=enrolled`);
      setStudents(res.data.students || []);
      setError(null);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditData({
      attendance_rate: 85,
      skill_level: 'intermediate',
      internal_rating: 5.5,
      parent_satisfaction: 4,
      months_enrolled: 3,
      strengths: 'Good tactical awareness',
      areas_to_improve: 'Opening theory'
    });
  };

  const handleSave = async (studentId) => {
    try {
      await axios.post(`${API_URL}/progress/${studentId}`, editData);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      alert('Error saving progress');
      console.error(err);
    }
  };

  const getSkillColor = (level) => {
    const levels = {
      'beginner': '#a29bfe',
      'intermediate': '#0984e3',
      'advanced': '#27ae60',
    };
    return levels[level] || '#95a5a6';
  };

  if (loading) return <div className="loading">Loading progress data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="progress-tracker">
      <div className="page-header">
        <h2>📈 Student Progress Tracking</h2>
        <p className="subtext">Monitor skill development, attendance, and engagement</p>
      </div>

      <div className="progress-table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Batch</th>
              <th>Attendance</th>
              <th>Skill Level</th>
              <th>Rating</th>
              <th>Parent Satisfaction</th>
              <th>Months</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className={editingId === student.id ? 'editing' : ''}>
                <td className="student-name">
                  <strong>{student.first_name} {student.last_name}</strong>
                </td>
                <td>{student.batch}</td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-bar-small">
                      <div className="fill" style={{ width: '85%' }}></div>
                    </div>
                    <span>85%</span>
                  </div>
                </td>
                <td>
                  {editingId === student.id ? (
                    <select
                      value={editData.skill_level}
                      onChange={(e) => setEditData({ ...editData, skill_level: e.target.value })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <span
                      className="skill-badge"
                      style={{ backgroundColor: getSkillColor('intermediate') }}
                    >
                      Intermediate
                    </span>
                  )}
                </td>
                <td>
                  {editingId === student.id ? (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={editData.internal_rating}
                      onChange={(e) => setEditData({ ...editData, internal_rating: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <span className="rating">5.5/10</span>
                  )}
                </td>
                <td>
                  {editingId === student.id ? (
                    <select
                      value={editData.parent_satisfaction}
                      onChange={(e) => setEditData({ ...editData, parent_satisfaction: parseInt(e.target.value) })}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  ) : (
                    <span className="satisfaction">⭐⭐⭐⭐</span>
                  )}
                </td>
                <td>{editingId === student.id ? (
                  <input
                    type="number"
                    min="0"
                    value={editData.months_enrolled}
                    onChange={(e) => setEditData({ ...editData, months_enrolled: parseInt(e.target.value) })}
                  />
                ) : (
                  '3 months'
                )}</td>
                <td>
                  {editingId === student.id ? (
                    <button
                      className="btn-save"
                      onClick={() => handleSave(student.id)}
                    >
                      <FiSave /> Save
                    </button>
                  ) : (
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(student)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="edit-details">
          <h3>Update Progress Details</h3>
          <div className="form-group">
            <label>Strengths</label>
            <textarea
              value={editData.strengths}
              onChange={(e) => setEditData({ ...editData, strengths: e.target.value })}
              placeholder="What areas is the student excelling in?"
            />
          </div>
          <div className="form-group">
            <label>Areas to Improve</label>
            <textarea
              value={editData.areas_to_improve}
              onChange={(e) => setEditData({ ...editData, areas_to_improve: e.target.value })}
              placeholder="What should the student focus on?"
            />
          </div>
          <div className="button-group">
            <button className="btn primary" onClick={() => handleSave(editingId)}>Save Changes</button>
            <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="progress-summary">
        <h3>Progress Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="label">Average Attendance</span>
            <span className="value">87%</span>
          </div>
          <div className="summary-card">
            <span className="label">Average Rating</span>
            <span className="value">5.2/10</span>
          </div>
          <div className="summary-card">
            <span className="label">Average Parent Satisfaction</span>
            <span className="value">4.1/5</span>
          </div>
          <div className="summary-card">
            <span className="label">Students on Track</span>
            <span className="value">{students.length}/​{students.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
