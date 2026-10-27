const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getUserReviews,
  getProjectReviews
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/project/:projectId', getProjectReviews);

module.exports = router;
