import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiBarChart2, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import CRMDashboard from './components/CRMDashboard';
import HotLeads from './components/HotLeads';
import AtRiskStudents from './components/AtRiskStudents';
import PipelineView from './components/PipelineView';
import ProgressTracker from './components/ProgressTracker';
import TaskManager from './components/TaskManager';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('crm-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'students': 'Students',
      'analytics': 'Analytics',
      'crm-dashboard': 'CRM Dashboard',
      'hot-leads': 'Hot Leads',
      'at-risk': 'At-Risk Students',
      'pipeline': 'Sales Pipeline',
      'progress': 'Progress Tracking',
      'tasks': 'Task Management'
    };
    return titles[currentPage] || 'Dashboard';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>MoharCRM</h1>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Operations</div>
            <button
              className={`nav-item ${currentPage === 'crm-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('crm-dashboard')}
            >
              <FiHome /> <span>CRM Dashboard</span>
            </button>
            <button
              className={`nav-item ${currentPage === 'hot-leads' ? 'active' : ''}`}
              onClick={() => setCurrentPage('hot-leads')}
            >
              <FiShoppingCart /> <span>Hot Leads</span>
            </button>
            <button
              className={`nav-item ${currentPage === 'pipeline' ? 'active' : ''}`}
              onClick={() => setCurrentPage('pipeline')}
            >
              <FiCheckCircle /> <span>Pipeline</span>
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            <button
              className={`nav-item ${currentPage === 'students' ? 'active' : ''}`}
              onClick={() => setCurrentPage('students')}
            >
              <FiUsers /> <span>Students</span>
            </button>
            <button
              className={`nav-item ${currentPage === 'progress' ? 'active' : ''}`}
              onClick={() => setCurrentPage('progress')}
            >
              <FiTrendingUp /> <span>Progress</span>
            </button>
            <button
              className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`}
              onClick={() => setCurrentPage('tasks')}
            >
              <FiCheckCircle /> <span>Tasks</span>
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Monitoring</div>
            <button
              className={`nav-item ${currentPage === 'at-risk' ? 'active' : ''}`}
              onClick={() => setCurrentPage('at-risk')}
            >
              <FiAlertTriangle /> <span>At-Risk</span>
            </button>
            <button
              className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentPage('analytics')}
            >
              <FiBarChart2 /> <span>Analytics</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2>{getPageTitle()}</h2>
          <div className="user-info">
            <span>Admin User</span>
          </div>
        </header>

        <div className="content-area">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'students' && <StudentList />}
          {currentPage === 'analytics' && <Dashboard showAnalytics={true} />}
          {currentPage === 'crm-dashboard' && <CRMDashboard />}
          {currentPage === 'hot-leads' && <HotLeads />}
          {currentPage === 'at-risk' && <AtRiskStudents />}
          {currentPage === 'pipeline' && <PipelineView />}
          {currentPage === 'progress' && <ProgressTracker />}
          {currentPage === 'tasks' && <TaskManager />}
        </div>
      </main>
    </div>
  );
}

export default App;
