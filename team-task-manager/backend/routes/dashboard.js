// routes/dashboard.js - Dashboard stats

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/dashboard - Get dashboard stats
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    // Members only see their own stats
    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = req.user._id;
    }

    // Get task counts
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Done' });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'In Progress' });

    // Overdue = due date is in the past and task is not done
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: 'Done' },
    });

    const pendingTasks = totalTasks - completedTasks;

    // Get total projects (admin sees all, member sees their projects)
    let totalProjects;
    if (req.user.role === 'admin') {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = await Project.countDocuments({ members: req.user._id });
    }

    // Get recent tasks (last 5)
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'title')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      inProgressTasks,
      totalProjects,
      recentTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
