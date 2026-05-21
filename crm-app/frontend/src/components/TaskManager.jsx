import { useEffect, useState } from 'react';
import { FiCheckCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // This would fetch from /api/tasks endpoint
      const mockTasks = [
        { id: 1, title: 'Call John - First Contact', priority: 'high', status: 'pending', dueDate: '2026-05-21', studentName: 'John Doe' },
        { id: 2, title: 'Send Trial Details Email', priority: 'high', status: 'pending', dueDate: '2026-05-21', studentName: 'Jane Smith' },
        { id: 3, title: 'Follow Up - Trial Completed', priority: 'medium', status: 'pending', dueDate: '2026-05-22', studentName: 'Bob Johnson' },
        { id: 4, title: 'Monthly Progress Check', priority: 'medium', status: 'completed', dueDate: '2026-05-20', studentName: 'Alice Brown' },
        { id: 5, title: 'Call Parent - At-Risk Alert', priority: 'high', status: 'pending', dueDate: '2026-05-21', studentName: 'David Lee' },
      ];
      setTasks(mockTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed' } : t
    );
    setTasks(updatedTasks);
  };

  const deleteTask = async (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: newTask,
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      studentName: 'Unassigned'
    };

    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedToday = tasks.filter(t => t.status === 'completed').length;

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="task-manager">
      <div className="page-header">
        <h2>📋 Task Management - Never Miss a Follow-up</h2>
        <p className="subtext">Track all action items and ensure consistent follow-ups</p>
      </div>

      {/* Task Stats */}
      <div className="task-stats">
        <div className="stat-card">
          <span className="stat-number">{pendingCount}</span>
          <span className="stat-label">Pending Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{completedToday}</span>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{(completedToday / (pendingCount + completedToday) * 100).toFixed(0)}%</span>
          <span className="stat-label">Completion Rate</span>
        </div>
      </div>

      {/* Add New Task */}
      <div className="add-task-section">
        <div className="input-group">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} className="btn-add">
            <FiPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedToday})
        </button>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <FiCheckCircle size={48} />
            <p>No {filter === 'all' ? 'tasks' : filter + ' tasks'} - Great work!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.status}`}>
              <div className="task-check">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => completeTask(task.id)}
                />
              </div>

              <div className="task-content">
                <h4 className={task.status === 'completed' ? 'completed' : ''}>
                  {task.title}
                </h4>
                <div className="task-meta">
                  <span className="student">{task.studentName}</span>
                  <span className="due-date">📅 {task.dueDate}</span>
                  <span className={`priority ${task.priority}`}>
                    {task.priority === 'high' ? '🔴' : '🟡'} {task.priority}
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <button
                  className="btn-delete"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Templates */}
      <div className="task-templates">
        <h3>Quick Task Templates</h3>
        <div className="template-buttons">
          <button className="template-btn">📞 Call Prospect</button>
          <button className="template-btn">📧 Send Email</button>
          <button className="template-btn">📅 Schedule Trial</button>
          <button className="template-btn">✅ Follow-up Check</button>
          <button className="template-btn">💬 Parent Message</button>
          <button className="template-btn">📊 Progress Update</button>
        </div>
      </div>
    </div>
  );
}
