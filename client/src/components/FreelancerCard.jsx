import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Briefcase, CheckCircle2 } from 'lucide-react';

const FreelancerCard = ({ freelancer, matchScore }) => {
  // Handle both direct user objects and {freelancer: userDoc, matchScore} format from AI matches
  const userData = freelancer?.freelancer || freelancer;
  const score = matchScore || freelancer?.matchScore;
  
  const { _id, name = 'Unknown Freelancer', avatar, bio, hourlyRate, experience, completedProjects, skills, rating } = userData || {};

  const getMatchScoreColor = (s) => {
    if (s >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (s >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-100">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{name}</h3>
            <p className="text-gray-600 text-sm line-clamp-1">{bio || 'Freelancer'}</p>
          </div>
        </div>
        {score > 0 && (
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${getMatchScoreColor(score)}`}>
            <span className="text-sm font-bold">{Math.round(score)}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {skills?.slice(0, 5).map((skill, index) => (
          <span key={index} className="bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium">
            {skill}
          </span>
        ))}
        {skills?.length > 5 && (
          <span className="bg-gray-50 text-gray-600 rounded-full px-3 py-1 text-xs font-medium">
            +{skills.length - 5} more
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-medium text-gray-900">{rating ? Number(rating).toFixed(1) : 'New'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">₹{hourlyRate || 0}</span>/hr
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{experience || 0} yrs exp.</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{completedProjects || 0} jobs</span>
        </div>
      </div>

      <Link 
        to={`/profile/${_id}`}
        className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors duration-200 mt-auto"
      >
        View Profile
      </Link>
    </div>
  );
};

export default FreelancerCard;
