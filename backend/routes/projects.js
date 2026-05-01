const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isProjectAdmin, isProjectMember } = require('../middleware/role');

router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, [body('name').trim().notEmpty().withMessage('Project name required')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const project = await Project.create({ name: req.body.name, description: req.body.description, owner: req.user._id, members: [] });
    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', protect, isProjectMember, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name email').populate('members', 'name email');
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, isProjectAdmin, [body('name').trim().notEmpty().withMessage('Project name required')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true, runValidators: true })
      .populate('owner', 'name email').populate('members', 'name email');
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, isProjectAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/:id/members', protect, isProjectAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });
    const project = req.project;
    if (project.owner.toString() === user._id.toString()) return res.status(400).json({ message: 'User is the project owner' });
    if (project.members.some(m => m.toString() === user._id.toString())) return res.status(400).json({ message: 'Already a member' });
    project.members.push(user._id);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id/members/:userId', protect, isProjectAdmin, async (req, res) => {
  try {
    const project = req.project;
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
