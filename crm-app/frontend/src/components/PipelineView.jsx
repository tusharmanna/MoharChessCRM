import { useEffect, useState } from 'react';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const PIPELINE_STAGES = [
  { key: 'inquiry', label: 'Inquiry', color: '#6c5ce7' },
  { key: 'interested', label: 'Interested', color: '#a29bfe' },
  { key: 'trial_scheduled', label: 'Trial Scheduled', color: '#0984e3' },
  { key: 'trial_completed', label: 'Trial Completed', color: '#00b894' },
  { key: 'negotiating', label: 'Negotiating', color: '#fdcb6e' },
  { key: 'enrolled', label: 'Enrolled', color: '#27ae60' },
  { key: 'lost', label: 'Lost', color: '#d63031' }
];

export default function PipelineView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students?limit=100&status=prospect`);
      setStudents(res.data.students || []);
      setError(null);
    } catch (err) {
      setError('Failed to load pipeline data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupByStage = () => {
    const grouped = {};
    PIPELINE_STAGES.forEach(stage => {
      grouped[stage.key] = [];
    });

    students.forEach(student => {
      // Default stage mapping
      const stage = student.pipeline_stage || 'inquiry';
      if (grouped[stage]) {
        grouped[stage].push(student);
      }
    });

    return grouped;
  };

  const grouped = groupByStage();

  if (loading) return <div className="loading">Loading pipeline...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pipeline-container">
      <div className="page-header">
        <h2>📊 Sales Pipeline - Prospect Journey</h2>
        <p className="subtext">Track prospects through each stage from Inquiry to Enrollment</p>
      </div>

      <div className="pipeline-board">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.key} className="pipeline-column">
            <div className="column-header" style={{ borderTopColor: stage.color }}>
              <h3 style={{ color: stage.color }}>{stage.label}</h3>
              <span className="count">{grouped[stage.key]?.length || 0}</span>
            </div>

            <div className="column-cards">
              {grouped[stage.key]?.map((prospect) => (
                <div key={prospect.id} className="prospect-card" style={{ borderLeftColor: stage.color }}>
                  <h4>{prospect.first_name} {prospect.last_name}</h4>
                  <p className="prospect-email">{prospect.email || 'No email'}</p>

                  <div className="prospect-details">
                    <span className="detail">
                      Age: {prospect.age || 'N/A'}
                    </span>
                    <span className="detail">
                      Exp: {prospect.chess_experience || 'Unknown'}
                    </span>
                  </div>

                  {prospect.days_in_stage && (
                    <div className="stage-time">
                      ⏱️ {prospect.days_in_stage} days in stage
                    </div>
                  )}

                  <div className="card-actions">
                    <button className="micro-btn">📞 Call</button>
                    <button className="micro-btn">📧 Email</button>
                    <button className="micro-btn">→ Move</button>
                  </div>
                </div>
              ))}

              {(!grouped[stage.key] || grouped[stage.key].length === 0) && (
                <div className="empty-column">
                  <p>No prospects in this stage</p>
                </div>
              )}

              <button className="add-prospect-btn">
                <FiPlus /> Add Prospect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Statistics */}
      <div className="pipeline-stats">
        <h3>Pipeline Health</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">Total Prospects</span>
            <span className="stat-value">{students.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Expected Enrollments (30 days)</span>
            <span className="stat-value">
              {students.filter(s => s.expected_enrollment_date).length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg Days to Enrollment</span>
            <span className="stat-value">~21 days</span>
          </div>
          <div className="stat">
            <span className="stat-label">Conversion Rate</span>
            <span className="stat-value">~45%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
