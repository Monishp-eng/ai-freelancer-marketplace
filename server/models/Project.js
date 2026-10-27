const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'submitted', 'approved', 'disputed'],
    default: 'pending'
  },
  deliverables: String,
  dueDate: Date,
  completedAt: Date
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requiredSkills: {
    type: [String],
    required: true
  },
  budget: {
    min: Number,
    max: Number
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  milestones: [milestoneSchema],
  category: {
    type: String,
    required: true
  },
  deadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ freelancer: 1 });
projectSchema.index({ requiredSkills: 1 });
projectSchema.index({ category: 1 });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
