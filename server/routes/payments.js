const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEscrowPayment,
  releaseMilestonePayment,
  disputePayment,
  getProjectPayments,
  getMyPayments
} = require('../controllers/paymentController');

router.post('/escrow', protect, authorize('client'), createEscrowPayment);
router.post('/release/:id', protect, authorize('client'), releaseMilestonePayment);
router.post('/dispute/:id', protect, disputePayment);
router.get('/project/:projectId', protect, getProjectPayments);
router.get('/my', protect, getMyPayments);

module.exports = router;
