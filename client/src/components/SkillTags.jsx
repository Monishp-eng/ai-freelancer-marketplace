import React from 'react';
import { X } from 'lucide-react';

const SkillTags = ({ skills = [], removable = false, onRemove, size = 'md' }) => {
  if (!skills || skills.length === 0) return null;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <div 
          key={`${skill}-${index}`} 
          className={`flex items-center bg-indigo-50 text-indigo-700 rounded-full font-medium transition-colors ${currentSizeClass} ${removable ? 'pr-1.5' : ''}`}
        >
          <span>{skill}</span>
          {removable && (
            <button
              type="button"
              onClick={() => onRemove && onRemove(skill)}
              className="ml-1.5 p-0.5 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors focus:outline-none"
              aria-label={`Remove ${skill}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillTags;
