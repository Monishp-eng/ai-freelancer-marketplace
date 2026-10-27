import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const { _id, title, description, budget, requiredSkills, status, category, client, milestones } = project;
  const clientName = client?.name || 'Unknown Client';
  const avatarUrl = client?.avatar;

  const getStatusBadge = (s) => {
    const statusConfig = {
      open: 'bg-green-50 text-green-700 border-green-200',
      'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    const colorClass = statusConfig[s?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClass}`}>
        {s?.replace('-', ' ')}
      </span>
    );
  };

  const approvedMilestones = milestones?.filter(m => m.status === 'approved').length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercentage = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="font-semibold text-lg text-gray-900 tracking-tight line-clamp-1">{title}</h3>
        {getStatusBadge(status)}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center gap-4 mb-5">
        <div className="text-gray-900 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg text-sm border border-gray-100">
          ₹{budget?.min || 0} - ₹{budget?.max || 0}
        </div>
        {category && (
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium px-2 py-1 bg-gray-50 rounded-lg">
            <Tag className="w-3.5 h-3.5" />
            {category}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {requiredSkills?.slice(0, 4).map((skill, index) => (
          <span key={index} className="bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 text-xs font-medium">
            {skill}
          </span>
        ))}
        {requiredSkills?.length > 4 && (
          <span className="bg-gray-50 text-gray-600 rounded-full px-2.5 py-1 text-xs font-medium">
            +{requiredSkills.length - 4}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50">
        {totalMilestones > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Milestones Progress</span>
              <span className="font-medium text-gray-700">{approvedMilestones}/{totalMilestones}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={clientName} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                {clientName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{clientName}</span>
          </div>
          
          <Link 
            to={`/projects/${_id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
