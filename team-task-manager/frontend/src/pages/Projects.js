// pages/Projects.js - Projects list and management

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', members: [] });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Could not load users');
    }
  };

  // Open modal for creating new project
  const openCreateModal = () => {
    setEditProject(null);
    setFormData({ title: '', description: '', members: [] });
    setFormError('');
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      members: project.members.map((m) => m._id),
    });
    setFormError('');
    setShowModal(true);
  };

  const handleMemberSelect = (e) => {
    // Get all selected options
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData({ ...formData, members: selected });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setFormError('Project title is required');
      return;
    }

    setSaving(true);
    try {
      if (editProject) {
        // Update existing project
        const res = await api.put(`/projects/${editProject._id}`, formData);
        setProjects(projects.map((p) => (p._id === editProject._id ? res.data : p)));
      } else {
        // Create new project
        const res = await api.post('/projects', formData);
        setProjects([res.data, ...projects]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            + New Project
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>{isAdmin ? 'No projects yet. Create your first project!' : 'You are not assigned to any projects yet.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Members</th>
                <th>Created By</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td><strong>{project.title}</strong></td>
                  <td style={{ color: '#666' }}>{project.description || '—'}</td>
                  <td>
                    <div className="members-list">
                      {project.members.length === 0 ? (
                        <span style={{ color: '#aaa' }}>No members</span>
                      ) : (
                        project.members.map((m) => (
                          <span key={m._id} className="member-tag">{m.name}</span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{project.createdBy?.name}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ marginRight: '6px' }} onClick={() => openEditModal(project)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(project._id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editProject ? 'Edit Project' : 'Create Project'}</h3>

            {formError && <div className="error-msg">{formError}</div>}

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional project description"
              />
            </div>
            <div className="form-group">
              <label>Members (hold Ctrl/Cmd to select multiple)</label>
              <select multiple value={formData.members} onChange={handleMemberSelect}>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editProject ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
