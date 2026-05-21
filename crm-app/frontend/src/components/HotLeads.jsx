import { useEffect, useState } from 'react';
import { FiPhone, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function HotLeads() {
  const [hotLeads, setHotLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const fetchHotLeads = async () => {
    try {
      const res = await axios.get(`${API_URL}/hot-leads`);
      setHotLeads(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load hot leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#ff6b6b'; // Hot red
    if (score >= 6) return '#ffa500'; // Orange
    return '#ffd93d'; // Yellow
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'hot') return '🔥 HOT';
    if (priority === 'medium') return '⚠️ MEDIUM';
    return '⏸️ LOW';
  };

  if (loading) return <div className="loading">Loading hot leads...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hot-leads-container">
      <div className="page-header">
        <h2>🔥 Hot Leads - Priority Prospects</h2>
        <p className="subtext">
          {hotLeads.length} prospects scoring 7+ that need immediate follow-up
        </p>
      </div>

      {hotLeads.length === 0 ? (
        <div className="empty-state">
          <FiCheckCircle size={48} />
          <p>No hot leads at the moment - all prospects are in nurture stage</p>
        </div>
      ) : (
        <div className="leads-list">
          {hotLeads.map((lead) => (
            <div
              key={lead.id}
              className="lead-card"
              onClick={() => setSelectedLead(lead)}
            >
              <div className="lead-header">
                <div className="lead-info">
                  <h3>{lead.first_name} {lead.last_name}</h3>
                  <p className="email">{lead.email || 'No email'}</p>
                </div>
                <div className="lead-score">
                  <div
                    className="score-badge"
                    style={{ backgroundColor: getScoreColor(lead.total_score) }}
                  >
                    {lead.total_score || 0}/10
                  </div>
                  <span className="priority">{getPriorityLabel(lead.priority)}</span>
                </div>
              </div>

              <div className="lead-details">
                <div className="detail">
                  <span className="label">Age:</span>
                  <span className="value">{lead.age || 'N/A'}</span>
                </div>
                <div className="detail">
                  <span className="label">Experience:</span>
                  <span className="value">{lead.chess_experience || 'Unknown'}</span>
                </div>
                <div className="detail">
                  <span className="label">Source:</span>
                  <span className="value">{lead.source_of_lead || 'Unknown'}</span>
                </div>
                <div className="detail">
                  <span className="label">Days in Stage:</span>
                  <span className="value">
                    {lead.days_in_stage || 0} days
                  </span>
                </div>
              </div>

              <div className="lead-actions">
                <button className="action-btn call">
                  <FiPhone /> Call Now
                </button>
                <button className="action-btn email">
                  <FiMail /> Send Email
                </button>
                <button className="action-btn schedule">
                  📅 Schedule Trial
                </button>
              </div>

              {lead.notes && (
                <div className="lead-notes">
                  <p><strong>Notes:</strong> {lead.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedLead(null)}>×</button>
            <div className="modal-header">
              <h2>{selectedLead.first_name} {selectedLead.last_name}</h2>
              <div className="score-badge large" style={{ backgroundColor: getScoreColor(selectedLead.total_score) }}>
                {selectedLead.total_score}/10
              </div>
            </div>

            <div className="modal-section">
              <h3>Contact Information</h3>
              <p><strong>Email:</strong> {selectedLead.email || 'N/A'}</p>
              <p><strong>Age:</strong> {selectedLead.age || 'N/A'}</p>
              <p><strong>Chess Experience:</strong> {selectedLead.chess_experience || 'Unknown'}</p>
            </div>

            <div className="modal-section">
              <h3>Lead Scoring Details</h3>
              <div className="score-breakdown">
                <p>Interest Level: {selectedLead.interest_level || 0}/3</p>
                <p>Engagement: {selectedLead.engagement_score || 0}/3</p>
                <p>Experience: {selectedLead.chess_experience_score || 0}/2</p>
                <p>Demographic Fit: {selectedLead.demographic_fit || 0}/2</p>
              </div>
            </div>

            <div className="modal-section">
              <h3>Next Steps</h3>
              <div className="action-buttons">
                <button className="btn primary">📞 Call Immediately</button>
                <button className="btn">📧 Send Personalized Email</button>
                <button className="btn">📅 Schedule Trial Class</button>
                <button className="btn">💾 Update Notes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
