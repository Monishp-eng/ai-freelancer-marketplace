const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const { getTopMatches } = require('../services/matchingService');

exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const project = new Project({
      ...req.body,
      client: req.user.id
    });
    
    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { status, category, minBudget, maxBudget, skills, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    
    if (minBudget || maxBudget) {
      query['budget.min'] = { $gte: minBudget || 0 };
      if (maxBudget) query['budget.max'] = { $lte: maxBudget };
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    const startIndex = (page - 1) * limit;
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('client', 'name avatar')
      .skip(startIndex)
      .limit(parseInt(limit, 10))
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      },
      data: projects
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar');
      
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
    }
    
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
    }
    
    if (project.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Can only delete open projects' });
    }
    
    project.status = 'cancelled';
    await project.save();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const isClient = req.user.role === 'client';
    const query = isClient ? { client: req.user.id } : { freelancer: req.user.id };
    
    const projects = await Project.find(query).sort('-createdAt');
    
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { id, milestoneIndex } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    const milestone = project.milestones[milestoneIndex];
    if (!milestone) {
      return res.status(404).json({ success: false, error: 'Milestone not found' });
    }
    
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.freelancer && project.freelancer.toString() === req.user.id;
    
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    if (isFreelancer && milestone.status === 'in-progress') {
      milestone.status = 'submitted';
    } else if (isClient && milestone.status === 'submitted') {
      milestone.status = 'approved';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid state transition' });
    }
    
    await project.save();
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectMatches = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    const matches = await getTopMatches(req.params.id, 10);
    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
