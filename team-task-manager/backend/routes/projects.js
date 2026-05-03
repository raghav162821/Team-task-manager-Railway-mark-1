// routes/projects.js - Project CRUD routes

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/projects - Get all projects
// Admin sees all projects, members see only their projects
router.get('/', protect, async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      // Admin gets all projects
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    } else {
      // Members only see projects they're part of
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id - Get a single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Members can only access their projects
    if (req.user.role !== 'admin' && !project.members.some((m) => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Create a new project (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  [body('title').notEmpty().withMessage('Project title is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, members } = req.body;

      const project = await Project.create({
        title,
        description,
        members: members || [],
        createdBy: req.user._id,
      });

      // Populate and return
      const populated = await Project.findById(project._id)
        .populate('createdBy', 'name email')
        .populate('members', 'name email');

      res.status(201).json(populated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/projects/:id - Update a project (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update fields
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id - Delete a project (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
