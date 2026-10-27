import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Projects } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function MyProjectsPage() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Open', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await Projects.getMyProjects();
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (filter === 'All') return true;
    const normalizedFilter = filter.toLowerCase().replace(' ', '-');
    return project.status?.toLowerCase() === normalizedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage your {user?.role === 'client' ? 'posted' : 'active'} projects</p>
        </div>
        {user?.role === 'client' && (
          <Link to="/projects/new" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Post New Project
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${filter !== 'All' ? filter.toLowerCase() : ''} projects found`}
          description={user?.role === 'client' ? "You haven't posted any projects matching this status yet." : "You don't have any projects matching this status."}
          actionLabel={user?.role === 'client' ? 'Post a Project' : 'Browse Projects'}
          actionLink={user?.role === 'client' ? '/projects/new' : '/projects'}
        />
      )}
    </div>
  );
}
