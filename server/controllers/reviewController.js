const Review = require('../models/Review');
const Project = require('../models/Project');

exports.createReview = async (req, res) => {
  try {
    const { projectId, targetUserId, rating, comment, communicationRating, qualityRating, timelinessRating } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Can only review completed projects' });
    }

    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.freelancer && project.freelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, error: 'Not a participant of this project' });
    }

    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this project' });
    }

    const review = new Review({
      project: projectId,
      reviewer: req.user.id,
      reviewee: targetUserId,
      rating,
      comment,
      communicationRating,
      qualityRating,
      timelinessRating,
      verified: true 
    });

    await review.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title category')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
