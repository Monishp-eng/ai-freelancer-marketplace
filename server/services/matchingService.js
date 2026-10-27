const natural = require('natural');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * Calculates a match score between a project and a freelancer.
 * @param {Object} project - The project document
 * @param {Object} freelancer - The freelancer user document
 * @returns {number} Score from 0 to 100
 */
const calculateMatchScore = (project, freelancer) => {
  let score = 0;

  // 1. Skill Match (40%)
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  
  const projectSkills = project.requiredSkills ? project.requiredSkills.join(' ').toLowerCase() : '';
  const freelancerSkills = freelancer.skills ? freelancer.skills.join(' ').toLowerCase() : '';
  
  tfidf.addDocument(projectSkills);
  
  let tfidfScore = 0;
  freelancerSkills.split(' ').forEach(skill => {
    tfidf.tfidfs(skill, (i, measure) => {
      tfidfScore += measure;
    });
  });

  const projectSkillsArr = project.requiredSkills ? project.requiredSkills.map(s => s.toLowerCase()) : [];
  const freelancerSkillsArr = freelancer.skills ? freelancer.skills.map(s => s.toLowerCase()) : [];
  
  let exactMatchCount = 0;
  freelancerSkillsArr.forEach(skill => {
    if (projectSkillsArr.includes(skill)) exactMatchCount++;
  });
  
  const exactMatchRatio = projectSkillsArr.length > 0 ? exactMatchCount / projectSkillsArr.length : 0;
  const skillScore = Math.min(100, (tfidfScore * 5) + (exactMatchRatio * 100)) * 0.40;
  score += skillScore;

  // 2. Experience Score (20%)
  const expYears = freelancer.experience || 0;
  const expScore = Math.min(100, Math.log1p(expYears) * 20) * 0.20;
  score += expScore;

  // 3. Performance Score (25%)
  const rating = freelancer.rating || 0; 
  const completedProjects = freelancer.completedProjects || 0;
  
  const ratingScore = (rating / 5) * 100;
  const projectCountScore = Math.min(100, (completedProjects / 50) * 100);
  
  const performanceScore = ((ratingScore * 0.7) + (projectCountScore * 0.3)) * 0.25;
  score += performanceScore;

  // 4. Budget Fit (15%)
  const hourlyRate = freelancer.hourlyRate || 0;
  let budgetScore = 0;
  
  if (project.budget && project.budget.min && project.budget.max) {
    if (hourlyRate >= project.budget.min && hourlyRate <= project.budget.max) {
      budgetScore = 100;
    } else if (hourlyRate < project.budget.min) {
      budgetScore = Math.max(0, 100 - ((project.budget.min - hourlyRate) / project.budget.min) * 100);
    } else {
      budgetScore = Math.max(0, 100 - ((hourlyRate - project.budget.max) / project.budget.max) * 100);
    }
  } else {
    budgetScore = 50; 
  }
  
  score += (budgetScore * 0.15);

  return Math.min(100, Math.max(0, score));
};

/**
 * Gets top freelancer matches for a project
 * @param {string} projectId 
 * @param {number} limit 
 * @returns {Array} List of freelancers with match scores
 */
const getTopMatches = async (projectId, limit = 10) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const freelancers = await User.find({ role: 'freelancer' });
    
    const matches = freelancers.map(freelancer => {
      const matchScore = calculateMatchScore(project, freelancer);
      return {
        freelancer,
        matchScore
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, limit);
  } catch (error) {
    throw error;
  }
};

/**
 * Computes and returns the match score for a proposal
 * @param {Object} project 
 * @param {Object} freelancer 
 * @returns {number}
 */
const computeProposalMatchScore = (project, freelancer) => {
  return calculateMatchScore(project, freelancer);
};

module.exports = {
  calculateMatchScore,
  getTopMatches,
  computeProposalMatchScore
};
