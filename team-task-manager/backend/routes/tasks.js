// routes/tasks.js - Task CRUD routes

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/tasks - Get tasks
// Admin sees all, member sees only their own
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    const { projectId } = req.query;

    let filter = {};
    if (projectId) filter.project = projectId;

    if (req.user.role === 'admin') {
      tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 });
    } else {
      // Members only see tasks assigned to them
      filter.assignedTo = req.user._id;
      tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 });
    }

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks/:id - Get a single task
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Member can only see their own tasks
    if (req.user.role !== 'admin' && !task.assignedTo._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - Create a task (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project is required'),
    body('assignedTo').notEmpty().withMessage('Assigned user is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, project, assignedTo, dueDate, status } = req.body;

      // Check if project exists
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const task = await Task.create({
        title,
        description,
        project,
        assignedTo,
        dueDate,
        status: status || 'To Do',
        createdBy: req.user._id,
      });

      const populated = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email');

      res.status(201).json(populated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/tasks/:id - Update a task
// Admin can update everything; Member can only update status
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update all fields
      const { title, description, assignedTo, dueDate, status, project } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (dueDate) task.dueDate = dueDate;
      if (status) task.status = status;
      if (project) task.project = project;
    } else {
      // Member can only update status of their own task
      if (!task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.body.status) {
        task.status = req.body.status;
      }
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete a task (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
