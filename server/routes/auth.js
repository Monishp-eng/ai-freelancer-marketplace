const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, getMe, demoLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role is required').isIn(['client', 'freelancer'])
], register);

router.post('/login', login);

router.post('/demo-login', demoLogin);

router.get('/me', protect, getMe);

module.exports = router;
