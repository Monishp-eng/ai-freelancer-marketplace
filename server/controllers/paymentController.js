const escrowService = require('../services/escrowService');
const Payment = require('../models/Payment');
const Project = require('../models/Project');

exports.createEscrowPayment = async (req, res) => {
  try {
    const { projectId, milestoneIndex } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await escrowService.createEscrowPayment(projectId, milestoneIndex, req.user.id);
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.releaseMilestonePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.payer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const updatedPayment = await escrowService.releaseMilestonePayment(req.params.id);
    
    res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.disputePayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.payer.toString() !== req.user.id && payment.payee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const updatedPayment = await escrowService.initiateDispute(req.params.id, reason);
    
    res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectPayments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id && (!project.freelancer || project.freelancer.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const payments = await Payment.find({ project: req.params.projectId })
      .populate('payer', 'name avatar')
      .populate('payee', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [
        { payer: req.user.id },
        { payee: req.user.id }
      ]
    })
      .populate('project', 'title')
      .populate('payer', 'name avatar')
      .populate('payee', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
