const Project = require('../models/Project');

const isProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: Admin only' });
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized: Not a project member' });
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { isProjectAdmin, isProjectMember };
