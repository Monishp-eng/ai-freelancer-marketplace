import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <h1 className="text-8xl font-bold text-gray-200 tracking-tight">404</h1>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">Page not found</h2>
          <p className="mt-2 text-lg text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="mt-10 flex space-x-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-6 py-2.5 font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
