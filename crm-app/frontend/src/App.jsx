import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiBarChart2 } from 'react-icons/fi';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <FiHome /> <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'students' ? 'active' : ''}`}
            onClick={() => setCurrentPage('students')}
          >
            <FiUsers /> <span>Students</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <FiBarChart2 /> <span>Analytics</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2>
            {currentPage === 'dashboard' && 'Dashboard'}
            {currentPage === 'students' && 'Students'}
            {currentPage === 'analytics' && 'Analytics'}
          </h2>
          <div className="user-info">
            <span>Admin User</span>
          </div>
        </header>

        <div className="content-area">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'students' && <StudentList />}
          {currentPage === 'analytics' && <Dashboard showAnalytics={true} />}
        </div>
      </main>
    </div>
  );
}

export default App;
