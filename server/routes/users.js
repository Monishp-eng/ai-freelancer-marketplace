const express = require('express');
const router = express.Router();

const {
  getFreelancers,
  getTopFreelancers,
  getUserById,
  updateProfile
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

router.get('/freelancers', getFreelancers);
router.get('/top', getTopFreelancers);
router.get('/:id', getUserById);
router.put('/profile', protect, updateProfile);

module.exports = router;
