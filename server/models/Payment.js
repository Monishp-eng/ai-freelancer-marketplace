const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  milestoneIndex: {
    type: Number,
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['held', 'released', 'refunded', 'disputed'],
    default: 'held'
  },
  stripePaymentIntentId: {
    type: String
  },
  transactionFee: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
paymentSchema.index({ project: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
