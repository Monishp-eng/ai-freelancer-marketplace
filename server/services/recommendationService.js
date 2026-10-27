const natural = require('natural');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Get recommended projects for a freelancer
 * @param {string} freelancerId 
 * @param {number} limit 
 * @returns {Array} List of recommended projects
 */
const getRecommendedProjects = async (freelancerId, limit = 10) => {
  try {
    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      throw new Error('Freelancer not found');
    }

    const openProjects = await Project.find({ status: 'open' });
    
    const freelancerSkills = freelancer.skills ? freelancer.skills.join(' ').toLowerCase() : '';
    
    const projectsWithScore = openProjects.map(project => {
      const projectSkills = project.requiredSkills ? project.requiredSkills.join(' ').toLowerCase() : '';
      
      const TfIdf = natural.TfIdf;
      const tfidf = new TfIdf();
      tfidf.addDocument(freelancerSkills);
      
      let tfidfScore = 0;
      projectSkills.split(' ').forEach(skill => {
        tfidf.tfidfs(skill, (i, measure) => {
          tfidfScore += measure;
        });
      });

      return {
        project,
        matchScore: tfidfScore
      };
    });

    projectsWithScore.sort((a, b) => b.matchScore - a.matchScore);
    return projectsWithScore.slice(0, limit).map(p => p.project);
  } catch (error) {
    throw error;
  }
};

/**
 * Get similar projects to a given project
 * @param {string} projectId 
 * @param {number} limit 
 * @returns {Array} List of similar projects
 */
const getSimilarProjects = async (projectId, limit = 5) => {
  try {
    const targetProject = await Project.findById(projectId);
    if (!targetProject) throw new Error('Project not found');

    const targetSkills = targetProject.requiredSkills ? targetProject.requiredSkills.join(' ').toLowerCase() : '';

    const otherProjects = await Project.find({
      _id: { $ne: projectId },
      status: 'open',
      category: targetProject.category
    });

    const projectsWithScore = otherProjects.map(project => {
      const projectSkills = project.requiredSkills ? project.requiredSkills.join(' ').toLowerCase() : '';
      
      const TfIdf = natural.TfIdf;
      const tfidf = new TfIdf();
      tfidf.addDocument(targetSkills);
      
      let tfidfScore = 0;
      projectSkills.split(' ').forEach(skill => {
        tfidf.tfidfs(skill, (i, measure) => {
          tfidfScore += measure;
        });
      });

      return {
        project,
        similarityScore: tfidfScore
      };
    });

    projectsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);
    return projectsWithScore.slice(0, limit).map(p => p.project);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getRecommendedProjects,
  getSimilarProjects
};
