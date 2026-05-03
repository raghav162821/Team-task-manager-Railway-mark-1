// pages/Dashboard.js - Main dashboard with stats

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    if (status === 'Done') return 'status-badge status-done';
    if (status === 'In Progress') return 'status-badge status-inprogress';
    return 'status-badge status-todo';
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <span style={{ color: '#7f8c8d', fontSize: '13px' }}>
          Welcome back, {user?.name}!
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">{stats.completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-number">{stats.overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card projects">
          <div className="stat-number">{stats.totalProjects}</div>
          <div className="stat-label">Projects</div>
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#1e2a3a' }}>
          Recent Tasks
        </h3>

        {stats.recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. {user?.role === 'admin' ? 'Create a project and add tasks!' : 'No tasks assigned to you yet.'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project?.title || 'N/A'}</td>
                    <td>{task.assignedTo?.name || 'N/A'}</td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      <span className={getStatusClass(task.status)}>{task.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
