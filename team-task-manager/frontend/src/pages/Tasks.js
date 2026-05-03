// pages/Tasks.js - Tasks list and management

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    dueDate: '',
    status: 'To Do',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchTasks = async (projectId = '') => {
    try {
      const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {}
  };

  // Filter by project
  const handleProjectFilter = (e) => {
    const val = e.target.value;
    setFilterProject(val);
    setLoading(true);
    fetchTasks(val);
  };

  const openCreateModal = () => {
    setEditTask(null);
    setFormData({ title: '', description: '', project: '', assignedTo: '', dueDate: '', status: 'To Do' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setFormError('Title is required'); return; }
    if (isAdmin && !formData.project) { setFormError('Project is required'); return; }
    if (isAdmin && !formData.assignedTo) { setFormError('Please assign a user'); return; }
    if (isAdmin && !formData.dueDate) { setFormError('Due date is required'); return; }

    setSaving(true);
    try {
      if (editTask) {
        // Admin can update everything, member only updates status
        const payload = isAdmin ? formData : { status: formData.status };
        const res = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editTask._id ? res.data : t)));
      } else {
        const res = await api.post('/tasks', formData);
        setTasks([res.data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'Done';
  };

  const getStatusClass = (task) => {
    if (isOverdue(task)) return 'status-badge status-overdue';
    if (task.status === 'Done') return 'status-badge status-done';
    if (task.status === 'In Progress') return 'status-badge status-inprogress';
    return 'status-badge status-todo';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Tasks</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            + New Task
          </button>
        )}
      </div>

      {/* Filter by project */}
      <div style={{ marginBottom: '16px' }}>
        <select
          value={filterProject}
          onChange={handleProjectFilter}
          style={{ padding: '7px 12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '13px' }}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>{isAdmin ? 'No tasks yet. Create one!' : 'No tasks assigned to you.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <div><strong>{task.title}</strong></div>
                    {task.description && <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{task.description}</div>}
                  </td>
                  <td>{task.project?.title || 'N/A'}</td>
                  <td>{task.assignedTo?.name || 'N/A'}</td>
                  <td style={{ color: isOverdue(task) ? '#e74c3c' : '#444' }}>
                    {formatDate(task.dueDate)}
                  </td>
                  <td>
                    <span className={getStatusClass(task)}>
                      {isOverdue(task) ? 'Overdue' : task.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" style={{ marginRight: '6px' }} onClick={() => openEditModal(task)}>
                      {isAdmin ? 'Edit' : 'Update'}
                    </button>
                    {isAdmin && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editTask ? (isAdmin ? 'Edit Task' : 'Update Status') : 'Create Task'}</h3>
            {formError && <div className="error-msg">{formError}</div>}

            {/* Admin sees full form; member only sees status */}
            {isAdmin ? (
              <>
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                </div>
                <div className="form-group">
                  <label>Project *</label>
                  <select value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
                    <option value="">Select project</option>
                    {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To *</label>
                  <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
                    <option value="">Select user</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
              </>
            ) : null}

            <div className="form-group">
              <label>Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
