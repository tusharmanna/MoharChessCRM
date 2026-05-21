import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiPhone, FiMail, FiTrendingDown } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AtRiskStudents() {
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchAtRiskStudents();
  }, []);

  const fetchAtRiskStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/at-risk-students`);
      setAtRiskStudents(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load at-risk students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (attendance) => {
    if (attendance < 60) return { level: 'CRITICAL', color: '#ff6b6b', icon: '🔴' };
    if (attendance < 75) return { level: 'HIGH', color: '#ffa500', icon: '🟠' };
    return { level: 'MEDIUM', color: '#ffd93d', icon: '🟡' };
  };

  const getRetentionStrategies = (student) => {
    const strategies = [];
    if ((student.attendance_rate || 0) < 75) strategies.push('Improve engagement');
    if ((student.parent_satisfaction || 5) < 3) strategies.push('Address concerns');
    if (!student.notes) strategies.push('Document issues');
    return strategies;
  };

  if (loading) return <div className="loading">Loading at-risk students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="at-risk-container">
      <div className="page-header">
        <h2>⚠️ At-Risk Students - Retention Focus</h2>
        <p className="subtext">
          {atRiskStudents.length} students showing signs of potential churn
        </p>
      </div>

      {atRiskStudents.length === 0 ? (
        <div className="empty-state">
          <FiTrendingDown size={48} />
          <p>Great! No students are currently at risk</p>
        </div>
      ) : (
        <div className="at-risk-list">
          {atRiskStudents.map((student) => {
            const risk = getRiskLevel(student.attendance_rate || 0);
            const strategies = getRetentionStrategies(student);

            return (
              <div key={student.id} className="at-risk-card" onClick={() => setSelectedStudent(student)}>
                <div className="card-header">
                  <div className="student-info">
                    <h3>{student.first_name} {student.last_name}</h3>
                    <p className="batch">{student.batch}</p>
                  </div>
                  <div className="risk-indicator">
                    <span className="risk-badge" style={{ backgroundColor: risk.color }}>
                      {risk.icon} {risk.level}
                    </span>
                  </div>
                </div>

                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">Attendance</span>
                    <span className="metric-value">{(student.attendance_rate || 0).toFixed(0)}%</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${student.attendance_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Parent Satisfaction</span>
                    <span className="metric-value">{student.parent_satisfaction || 0}/5</span>
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < (student.parent_satisfaction || 0) ? 'filled' : ''}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>

                {strategies.length > 0 && (
                  <div className="strategies">
                    <h4>Recommended Actions:</h4>
                    <ul>
                      {strategies.map((strategy, idx) => (
                        <li key={idx}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="quick-actions">
                  <button className="action-btn call">
                    <FiPhone /> Call Parent
                  </button>
                  <button className="action-btn email">
                    <FiMail /> Send Offer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedStudent(null)}>×</button>

            <div className="modal-header">
              <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
              <span className="risk-badge large" style={{ backgroundColor: getRiskLevel(selectedStudent.attendance_rate || 0).color }}>
                {getRiskLevel(selectedStudent.attendance_rate || 0).level}
              </span>
            </div>

            <div className="modal-section">
              <h3>Performance Metrics</h3>
              <div className="metric-detail">
                <p><strong>Attendance Rate:</strong> {(selectedStudent.attendance_rate || 0).toFixed(0)}%</p>
                <p><strong>Months Enrolled:</strong> {selectedStudent.months_enrolled || 0}</p>
                <p><strong>Parent Satisfaction:</strong> {selectedStudent.parent_satisfaction || 0}/5</p>
                <p><strong>Batch:</strong> {selectedStudent.batch}</p>
              </div>
            </div>

            <div className="modal-section">
              <h3>Retention Strategy</h3>
              <div className="strategies-detailed">
                <p>Issues Identified:</p>
                <ul>
                  {(selectedStudent.attendance_rate || 0) < 75 && <li>Low attendance - investigate barriers</li>}
                  {(selectedStudent.parent_satisfaction || 5) < 3 && <li>Parent concerns - schedule check-in call</li>}
                  <li>Consider special offer or schedule change</li>
                </ul>
              </div>
            </div>

            <div className="modal-section">
              <h3>Action Items</h3>
              <div className="action-buttons">
                <button className="btn primary">📞 Call Parent Today</button>
                <button className="btn">📧 Send Personal Offer</button>
                <button className="btn">🎁 Offer Incentive (Free Class)</button>
                <button className="btn">📝 Update Notes</button>
              </div>
            </div>

            {selectedStudent.notes && (
              <div className="modal-section">
                <h3>Previous Notes</h3>
                <p>{selectedStudent.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
