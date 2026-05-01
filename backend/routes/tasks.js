const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { isProjectAdmin, isProjectMember } = require('../middleware/role');

router.get('/', protect, async (req, res) => {
  try {
    const { projectId, status, priority, assignee } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    const userProjects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] });
    const projectIds = userProjects.map(p => p._id.toString());
    if (projectId && !projectIds.includes(projectId)) return res.status(403).json({ message: 'Not authorized' });
    if (!projectId) filter.project = { $in: projectIds };
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, [body('title').trim().notEmpty().withMessage('Task title required'), body('projectId').notEmpty().withMessage('Project ID required')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const { title, description, projectId, assignee, status, priority, dueDate } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only admin can create tasks' });
    const task = await Task.create({ title, description, project: projectId, assignee: assignee || null, createdBy: req.user._id, status: status || 'todo', priority: priority || 'medium', dueDate: dueDate || null });
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');
    res.status(201).json(task);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    if (!isOwner && !isAssignee) return res.status(403).json({ message: 'Not authorized to update this task' });
    const { title, description, assignee, status, priority, dueDate } = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, { title, description, assignee, status, priority, dueDate }, { new: true, runValidators: true })
      .populate('assignee', 'name email').populate('createdBy', 'name email').populate('project', 'name');
    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Not authorized' });
    const { status } = req.body;
    if (!['todo', 'in-progress', 'done'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    task.status = status;
    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');
    res.json(task);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only admin can delete tasks' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
