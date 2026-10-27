import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionLink, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 text-center tracking-tight">
        {title}
      </h3>
      
      <p className="text-gray-500 mt-2 text-center max-w-md text-sm">
        {description}
      </p>
      
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors duration-200"
        >
          {actionLabel}
        </Link>
      )}
      
      {actionLabel && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
