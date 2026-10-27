require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Proposal = require('./models/Proposal');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not set in environment.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing data
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('Seeding demo users...');
    const clientUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo.client@freelanceai.com',
      password: 'demo123456',
      role: 'client',
      bio: 'Tech entrepreneur looking to build amazing products. I love working with talented freelancers to bring ideas to life.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    });

    const freelancerUser = await User.create({
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
    });

    const freelancer2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.vance@freelanceai.com',
      password: 'demo123456',
      role: 'freelancer',
      bio: 'Senior UI/UX Designer and Frontend Specialist creating delightful responsive web apps.',
      skills: ['Figma', 'UI/UX', 'React', 'Tailwind CSS', 'CSS3', 'Next.js'],
      experience: 4,
      hourlyRate: 1200,
      rating: 4.9,
      reviewCount: 16,
      completedProjects: 12,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    });

    console.log('Seeding projects...');
    const project1 = await Project.create({
      title: 'Healthcare Patient Portal & Telemedicine Web App',
      description: 'Looking for a full-stack developer to create a secure, HIPAA-compliant patient management dashboard with video appointment scheduling, automated reminders, and prescription history tracking.',
      client: clientUser._id,
      freelancer: freelancerUser._id,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'Tailwind CSS'],
      budget: { min: 60000, max: 95000 },
      status: 'in-progress',
      category: 'Web Development',
      milestones: [
        { title: 'UI Wireframes & Authentication', description: 'Complete Figma designs and JWT auth setup', amount: 20000, status: 'approved' },
        { title: 'Appointment Scheduling & Telehealth API', description: 'Video integration and calendar sync', amount: 30000, status: 'submitted' },
        { title: 'Testing, Deployment & Documentation', description: 'Security audit and cloud deployment', amount: 25000, status: 'pending' }
      ]
    });

    const project2 = await Project.create({
      title: 'AI-Powered Smart Expense Tracker & Receipt Scanner',
      description: 'Develop a modern SaaS dashboard featuring OCR receipt parsing, automated expense categorization using NLP, and exportable financial reports.',
      client: clientUser._id,
      requiredSkills: ['Python', 'React', 'Node.js', 'Machine Learning', 'Tailwind CSS'],
      budget: { min: 40000, max: 70000 },
      status: 'open',
      category: 'AI & Data Science',
      milestones: [
        { title: 'Backend OCR Engine & Endpoints', description: 'API for processing uploaded receipt images', amount: 25000, status: 'pending' },
        { title: 'Frontend Analytics Dashboard', description: 'Interactive charts and transaction lists', amount: 30000, status: 'pending' }
      ]
    });

    const project3 = await Project.create({
      title: 'Mobile Banking & Escrow Payment UI Redesign',
      description: 'Complete UI/UX overhaul of our fintech web application. Needs high-conversion landing page, responsive dashboard, and animated checkout flow.',
      client: clientUser._id,
      freelancer: freelancer2._id,
      requiredSkills: ['Figma', 'UI/UX', 'React', 'Tailwind CSS'],
      budget: { min: 30000, max: 50000 },
      status: 'completed',
      category: 'Design & Creative',
      milestones: [
        { title: 'Design System & Figma Prototypes', description: 'Color palette, typography, component library', amount: 15000, status: 'approved' },
        { title: 'Frontend Component Implementation', description: 'Translating Figma designs into responsive React components', amount: 20000, status: 'approved' }
      ]
    });

    console.log('Seeding proposals...');
    await Proposal.create({
      project: project2._id,
      freelancer: freelancerUser._id,
      coverLetter: 'I have extensive experience building AI dashboards and React frontend apps. I would love to build the OCR parser and SaaS dashboard for you.',
      bidAmount: 50000,
      estimatedDays: 14,
      status: 'pending'
    });

    console.log('Seeding payments...');
    await Payment.create({
      project: project1._id,
      milestoneIndex: 0,
      payer: clientUser._id,
      payee: freelancerUser._id,
      amount: 20000,
      status: 'released',
      stripePaymentIntentId: 'pi_test_healthcare_m1'
    });

    await Payment.create({
      project: project1._id,
      milestoneIndex: 1,
      payer: clientUser._id,
      payee: freelancerUser._id,
      amount: 30000,
      status: 'held',
      stripePaymentIntentId: 'pi_test_healthcare_m2'
    });

    console.log('Seeding reviews...');
    await Review.create({
      project: project3._id,
      reviewer: clientUser._id,
      reviewee: freelancer2._id,
      rating: 5,
      comment: 'Marcus did a phenomenal job redesigning our UI! Super responsive and delivered ahead of schedule.'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
