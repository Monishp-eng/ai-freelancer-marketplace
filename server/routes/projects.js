const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  updateMilestoneStatus,
  getProjectMatches
} = require('../controllers/projectController');

// Assuming auth middleware exists
const { protect, authorize } = require('../middleware/auth');

router.post('/',
  protect,
  authorize('client'),
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('budget', 'Budget is required').isObject(),
    body('milestones', 'Milestones must be an array').isArray()
  ],
  createProject
);

router.get('/', getProjects);

router.get('/my', protect, getMyProjects);

router.get('/:id', getProjectById);

router.put('/:id', protect, updateProject);

router.delete('/:id', protect, deleteProject);

router.put('/:id/milestones/:milestoneIndex', protect, updateMilestoneStatus);

router.get('/:id/matches', protect, authorize('client'), getProjectMatches);

module.exports = router;
