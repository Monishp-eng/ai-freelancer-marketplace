const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Project = require('../models/Project');
const Payment = require('../models/Payment');

/**
 * Creates an escrow payment intent
 * @param {string} projectId 
 * @param {number} milestoneIndex 
 * @param {string} payerId 
 */
const createEscrowPayment = async (projectId, milestoneIndex, payerId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const milestone = project.milestones[milestoneIndex];
    if (!milestone) throw new Error('Milestone not found');
    if (milestone.status !== 'pending') throw new Error('Milestone is not pending');

    const amountInCents = Math.round(milestone.amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        projectId: projectId.toString(),
        milestoneIndex: milestoneIndex.toString()
      }
    });

    const payment = new Payment({
      project: projectId,
      payer: payerId,
      payee: project.freelancer,
      amount: milestone.amount,
      milestoneIndex,
      stripePaymentIntentId: paymentIntent.id,
      status: 'held'
    });

    await payment.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Releases a milestone payment to the freelancer
 * @param {string} paymentId 
 */
const releaseMilestonePayment = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'held') throw new Error('Payment is not held in escrow');

    // Simulate Stripe Transfer (in test mode/real world you would need Stripe Connect)
    // await stripe.transfers.create({
    //   amount: payment.amount * 100,
    //   currency: 'usd',
    //   destination: 'acct_123' // Payee's connected account ID
    // });

    payment.status = 'released';
    await payment.save();

    const project = await Project.findById(payment.project);
    if (project && project.milestones[payment.milestoneIndex]) {
      project.milestones[payment.milestoneIndex].status = 'approved';
      
      const allApproved = project.milestones.every(m => m.status === 'approved');
      if (allApproved) {
        project.status = 'completed';
      }
      
      await project.save();
    }

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * Initiates a dispute for a payment
 * @param {string} paymentId 
 * @param {string} reason 
 */
const initiateDispute = async (paymentId, reason) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');

    payment.status = 'disputed';
    payment.disputeReason = reason;
    await payment.save();

    const project = await Project.findById(payment.project);
    if (project && project.milestones[payment.milestoneIndex]) {
      project.milestones[payment.milestoneIndex].status = 'disputed';
      await project.save();
    }

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * Refunds a payment
 * @param {string} paymentId 
 */
const refundPayment = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');

    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId
    });

    payment.status = 'refunded';
    await payment.save();

    return payment;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createEscrowPayment,
  releaseMilestonePayment,
  initiateDispute,
  refundPayment
};
