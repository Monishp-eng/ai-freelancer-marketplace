const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Helper to generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, skills, hourlyRate, experience, yearsOfExperience, bio } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Build user data
    const userData = { name, email, password, role };
    if (role === 'freelancer') {
      if (skills) userData.skills = skills;
      if (hourlyRate) userData.hourlyRate = hourlyRate;
      if (experience || yearsOfExperience) userData.experience = experience || yearsOfExperience;
      if (bio) userData.bio = bio;
    }

    // Create user
    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Demo login - auto-create and login as demo user
 * @route   POST /api/auth/demo-login
 * @access  Public
 */
const demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['client', 'freelancer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role (client/freelancer) is required' });
    }

    const demoAccounts = {
      client: {
        name: 'Alex Johnson',
        email: 'demo.client@freelanceai.com',
        password: 'demo123456',
        role: 'client',
        bio: 'Tech entrepreneur looking to build amazing products. I love working with talented freelancers to bring ideas to life.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      },
      freelancer: {
        name: 'Sarah Chen',
        email: 'demo.freelancer@freelanceai.com',
        password: 'demo123456',
        role: 'freelancer',
        bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionate about clean code and user-centric design.',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Tailwind CSS', 'Python', 'GraphQL'],
        experience: 5,
        hourlyRate: 1500,
        rating: 4.8,
        reviewCount: 24,
        completedProjects: 18,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        portfolio: [
          { title: 'E-Commerce Platform', description: 'Built a full-stack marketplace with React and Node.js', link: 'https://example.com' },
          { title: 'AI Dashboard', description: 'Real-time analytics dashboard with data visualization', link: 'https://example.com' },
          { title: 'Mobile Banking App', description: 'Cross-platform fintech application', link: 'https://example.com' }
        ]
      }
    };

    const demoData = demoAccounts[role];

    // Find or create demo user
    let user = await User.findOne({ email: demoData.email });

    if (!user) {
      user = await User.create(demoData);
    }

    const token = generateToken(user._id);

    // Return user without password
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
  generateToken
};
