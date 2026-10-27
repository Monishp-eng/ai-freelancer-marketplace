const User = require('../models/User');
const Review = require('../models/Review');

/**
 * @desc    Get all freelancers
 * @route   GET /api/users/freelancers
 * @access  Public
 */
const getFreelancers = async (req, res, next) => {
  try {
    const { skills, minRating, maxRate, page = 1, limit = 10, search } = req.query;

    let query = { role: 'freelancer' };

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (maxRate) {
      query.hourlyRate = { $lte: Number(maxRate) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments(query);

    const freelancers = await User.find(query)
      .skip(startIndex)
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: freelancers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: freelancers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Populate reviews for the user
    const reviews = await Review.find({ reviewee: user._id }).populate('reviewer', 'name avatar');

    res.status(200).json({
      success: true,
      data: { ...user.toJSON(), reviews }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      skills: req.body.skills,
      experience: req.body.experience,
      hourlyRate: req.body.hourlyRate,
      portfolio: req.body.portfolio,
      isAvailable: req.body.isAvailable,
      avatar: req.body.avatar
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top freelancers
 * @route   GET /api/users/top
 * @access  Public
 */
const getTopFreelancers = async (req, res, next) => {
  try {
    const topFreelancers = await User.find({ role: 'freelancer' })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: topFreelancers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFreelancers,
  getUserById,
  updateProfile,
  getTopFreelancers
};
