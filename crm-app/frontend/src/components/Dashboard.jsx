import { useEffect, useState } from 'react';
import { FiUsers, FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';
import { studentAPI } from '../api';
import './Dashboard.css';

function Dashboard({ showAnalytics }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await studentAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!stats) {
    return <div className="dashboard-error">Failed to load statistics</div>;
  }

  const statusCounts = {};
  stats.byStatus.forEach((item) => {
    statusCounts[item.status] = item.count;
  });

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card prospect">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>Prospects</h3>
            <p className="stat-value">{statusCounts['prospect'] || 0}</p>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <h3>Active Students</h3>
            <p className="stat-value">{statusCounts['active'] || 0}</p>
          </div>
        </div>

        <div className="stat-card enrolled">
          <div className="stat-icon">
            <FiTarget />
          </div>
          <div className="stat-content">
            <h3>Enrolled</h3>
            <p className="stat-value">{statusCounts['enrolled'] || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Students by Batch</h3>
          <div className="batch-list">
            {stats.topBatches.map((batch) => (
              <div key={batch.batch} className="batch-item">
                <span className="batch-name">{batch.batch}</span>
                <span className="batch-count">{batch.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Status Distribution</h3>
          <div className="status-list">
            {stats.byStatus.map((status) => {
              const percentage = ((status.count / stats.total) * 100).toFixed(1);
              return (
                <div key={status.status} className="status-item">
                  <div className="status-row">
                    <span className="status-name">{status.status}</span>
                    <span className="status-percent">{percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${status.status}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
