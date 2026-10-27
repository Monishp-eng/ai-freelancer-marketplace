import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Projects } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, IndianRupee, Star, Plus, Search, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        if (user.role === 'client') {
          const res = await Projects.getMyProjects();
          setProjects(Array.isArray(res.data) ? res.data : []);
        } else {
          const res = await Projects.getProjects({ limit: 3 });
          setProjects(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 py-12 flex justify-center"><LoadingSpinner /></div>;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-gray-500">{currentDate}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mr-4">
              <Briefcase className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.role === 'client' ? projects.filter(p => p.status === 'in_progress').length : '2'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mr-4">
              <IndianRupee className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {user.role === 'client' ? 'Total Spent' : 'Total Earned'}
              </p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mr-4">
              <Star className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.rating ? Number(user.rating).toFixed(1) : 'New'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  {user.role === 'client' ? 'Recent Projects' : 'Recommended Projects'}
                </h2>
                <Link to={user.role === 'client' ? '/my-projects' : '/projects'} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View All
                </Link>
              </div>
              
              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500">No projects found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard key={project._id || project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user.role === 'client' ? (
                  <>
                    <Link to="/projects/new" className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Project
                    </Link>
                    <Link to="/projects" className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Projects
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/projects" className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      <Search className="w-4 h-4 mr-2" />
                      Find Work
                    </Link>
                    <Link to="/settings" className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 mr-2" />
                      Update Profile
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Milestones</h3>
              <div className="text-center py-6 text-gray-500 text-sm">
                No active milestones at the moment.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
