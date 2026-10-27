const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createProposal,
  getMyProposals,
  getProjectProposals,
  acceptProposal,
  rejectProposal
} = require('../controllers/proposalController');

router.post('/', protect, authorize('freelancer'), createProposal);

router.get('/my', protect, authorize('freelancer'), getMyProposals);

router.get('/project/:projectId', protect, getProjectProposals);

router.put('/:id/accept', protect, authorize('client'), acceptProposal);

router.put('/:id/reject', protect, authorize('client'), rejectProposal);

module.exports = router;
