import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, Star, Briefcase, IndianRupee, Award, ArrowLeft } from 'lucide-react';
import { Projects } from '../services/api';
import FreelancerCard from '../components/FreelancerCard';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function AIMatchesPage() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await Projects.getProjectMatches(id);
        // res.data could be an array of matches or an object with matches/project
        if (Array.isArray(res.data)) {
          setMatches(res.data);
        } else {
          setMatches(res.data?.matches || []);
          setProjectTitle(res.data?.project?.title || 'Your Project');
        }
      } catch (err) {
        console.error('Failed to load AI matches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/projects/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Project
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Brain className="w-8 h-8 text-indigo-600 mr-3" />
          AI-Powered Matches for: {projectTitle}
        </h1>
        <p className="text-gray-600 mt-2">
          Our AI engine analyzes skills, experience, ratings, and budget fit to find the best freelancers for your project.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4">
          <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Skill Match (40%)</h3>
            <p className="text-xs text-gray-500 mt-1">Alignment with required project technologies</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4">
          <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
            <Briefcase className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Experience (20%)</h3>
            <p className="text-xs text-gray-500 mt-1">Years active and completed similar projects</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4">
          <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
            <Star className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Performance (25%)</h3>
            <p className="text-xs text-gray-500 mt-1">Client ratings, reviews, and completion rate</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4">
          <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Budget Fit (15%)</h3>
            <p className="text-xs text-gray-500 mt-1">Match with proposed budget range</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((freelancer) => (
            <FreelancerCard key={freelancer._id} freelancer={freelancer} matchScore={freelancer.matchScore} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No perfect matches found yet"
          description="We couldn't find exact matches based on the criteria. Try adjusting your project requirements."
          actionLabel="Edit Project"
          actionLink={`/projects/${id}/edit`}
        />
      )}
    </div>
  );
}
