const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] });
    const projectIds = projects.map(p => p._id);
    const now = new Date();

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $lt: now, $ne: null } })
    ]);

    const myTasks = await Task.find({ assignee: userId, status: { $ne: 'done' } })
      .populate('project', 'name').populate('assignee', 'name email')
      .sort({ dueDate: 1 }).limit(5);

    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name').populate('assignee', 'name email').populate('createdBy', 'name')
      .sort({ createdAt: -1 }).limit(8);

    res.json({
      stats: { totalProjects: projects.length, totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks },
      myTasks,
      recentTasks
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
