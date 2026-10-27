const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const { computeProposalMatchScore } = require('../services/matchingService');

exports.createProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDuration } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    if (project.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Project is no longer open' });
    }

    const existingProposal = await Proposal.findOne({
      project: projectId,
      freelancer: req.user.id
    });

    if (existingProposal) {
      return res.status(400).json({ success: false, error: 'You have already submitted a proposal for this project' });
    }

    const matchScore = computeProposalMatchScore(project, req.user);

    const proposal = new Proposal({
      project: projectId,
      freelancer: req.user.id,
      coverLetter,
      bidAmount,
      estimatedDuration,
      matchScore
    });

    await proposal.save();
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project owner can see all proposals
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate('freelancer', 'name avatar skills rating completedProjects')
      .sort('-matchScore');

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate({
        path: 'project',
        select: 'title status budget client',
        populate: {
          path: 'client',
          select: 'name'
        }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }

    const project = proposal.project;
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Project is no longer open' });
    }

    // Accept this proposal
    proposal.status = 'accepted';
    await proposal.save();

    // Reject all other pending proposals for this project
    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Update project
    project.status = 'in-progress';
    project.freelancer = proposal.freelancer;
    await project.save();

    // Create a conversation
    const conversation = new Conversation({
      participants: [project.client, project.freelancer],
      project: project._id
    });
    await conversation.save();

    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }

    if (proposal.project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Proposal is already processed' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
