import { useEffect, useState } from 'react';
import { FiTrendingUp, FiAlertCircle, FiTarget, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function CRMDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_URL}/crm-dashboard`);
      setMetrics(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load CRM metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading CRM Dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!metrics) return <div className="error">No data available</div>;

  return (
    <div className="crm-dashboard">
      <div className="metrics-grid">
        {/* Total Leads Card */}
        <div className="metric-card">
          <div className="metric-header">
            <FiTarget className="metric-icon target" />
            <h3>Active Leads</h3>
          </div>
          <div className="metric-value">{metrics.totalLeads || 0}</div>
          <div className="metric-label">Prospects in pipeline</div>
        </div>

        {/* Hot Leads Card */}
        <div className="metric-card hot">
          <div className="metric-header">
            <FiTrendingUp className="metric-icon hot" />
            <h3>Hot Leads</h3>
          </div>
          <div className="metric-value">{metrics.hotLeads || 0}</div>
          <div className="metric-label">Priority follow-ups needed</div>
          <div className="card-action">→ View Hot Leads</div>
        </div>

        {/* Enrolled Students Card */}
        <div className="metric-card enrolled">
          <div className="metric-header">
            <FiCheckCircle className="metric-icon enrolled" />
            <h3>Enrolled Students</h3>
          </div>
          <div className="metric-value">{metrics.enrolled || 0}</div>
          <div className="metric-label">Active students</div>
        </div>

        {/* At-Risk Students Card */}
        <div className="metric-card atrisk">
          <div className="metric-header">
            <FiAlertCircle className="metric-icon atrisk" />
            <h3>At-Risk Students</h3>
          </div>
          <div className="metric-value">{metrics.atRiskStudents || 0}</div>
          <div className="metric-label">Needs attention</div>
          <div className="card-action">→ View At-Risk</div>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="conversion-section">
        <h3>Inquiry to Enrollment Rate</h3>
        <div className="conversion-bar">
          <div
            className="conversion-progress"
            style={{ width: `${metrics.conversionRate || 0}%` }}
          >
            <span>{metrics.conversionRate?.toFixed(1) || 0}%</span>
          </div>
        </div>
        <p className="conversion-info">
          {metrics.enrolled || 0} of {(metrics.totalLeads || 0) + (metrics.enrolled || 0)} inquiries converted
        </p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">📞 Call Hot Lead</button>
          <button className="action-btn">📧 Send Follow-up Email</button>
          <button className="action-btn">📋 Schedule Trial</button>
          <button className="action-btn">💬 Message Parent</button>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="health-section">
        <h3>CRM Health</h3>
        <div className="health-items">
          <div className="health-item good">
            <span>📊 Data Quality</span>
            <span className="health-value">Good</span>
          </div>
          <div className="health-item good">
            <span>⚡ System Status</span>
            <span className="health-value">Healthy</span>
          </div>
          <div className="health-item">
            <span>👥 Team Activity</span>
            <span className="health-value">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
