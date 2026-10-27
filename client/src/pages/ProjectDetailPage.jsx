import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Projects, Proposals, Messages } from '../services/api';
import MilestoneTracker from '../components/MilestoneTracker';
import ChatWindow from '../components/ChatWindow';
import ProposalForm from '../components/ProposalForm';
import SkillTags from '../components/SkillTags';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Calendar, IndianRupee, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProposalForm, setShowProposalForm] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const res = await Projects.getProjectById(id);
      setProject(res.data);
      
      if (user?.role === 'client' && (res.data?.client?._id === user?._id || res.data?.client === user?._id)) {
        const propRes = await Proposals.getProjectProposals(id);
        setProposals(Array.isArray(propRes.data) ? propRes.data : []);
      }
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMilestoneUpdate = async (milestoneIndex, status) => {
    try {
      await Projects.updateMilestoneStatus(id, milestoneIndex, status);
      toast.success('Milestone updated');
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await Proposals.acceptProposal(proposalId);
      toast.success('Proposal accepted successfully');
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to accept proposal');
    }
  };

  const handleProposalSubmit = async (data) => {
    try {
      await Proposals.createProposal({ ...data, project: id });
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to submit proposal');
    }
  };

  if (isLoading || !project) {
    return <div className="min-h-screen bg-gray-50 py-20 flex justify-center"><LoadingSpinner /></div>;
  }

  const isClient = user?.role === 'client';
  const isOwner = isClient && (project.client?._id === user?._id || project.client === user?._id);
  const isFreelancer = user?.role === 'freelancer';
  const isAssigned = project.freelancer?._id === user?._id || project.freelancer === user?._id;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'open' ? 'bg-green-100 text-green-800' :
                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status?.replace('-', ' ').toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {project.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-500 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Posted on {new Date(project.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            {isFreelancer && project.status === 'open' && !showProposalForm && (
              <button 
                onClick={() => setShowProposalForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
              >
                Submit Proposal
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`${activeTab === 'milestones' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Milestones
                </button>
                {isOwner && (
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className={`${activeTab === 'proposals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    Proposals
                    {proposals.length > 0 && (
                      <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">{proposals.length}</span>
                    )}
                  </button>
                )}
                {(isOwner || isAssigned) && (
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`${activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Messages
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {showProposalForm && isFreelancer ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Submit your proposal</h3>
                  <ProposalForm projectId={project.id || project._id} onSubmit={handleProposalSubmit} />
                  <button onClick={() => setShowProposalForm(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              ) : activeTab === 'overview' ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Project Description</h3>
                    <div className="text-gray-600 whitespace-pre-wrap">{project.description}</div>
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
                    <SkillTags skills={project.requiredSkills || []} />
                  </div>
                </div>
              ) : activeTab === 'milestones' ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <MilestoneTracker 
                    milestones={project.milestones || []} 
                    userRole={user?.role} 
                    onUpdateStatus={handleMilestoneUpdate}
                    projectId={project.id || project._id} 
                  />
                </div>
              ) : activeTab === 'proposals' && isOwner ? (
                <div className="space-y-4">
                  {proposals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                      <p className="text-gray-500">No proposals received yet.</p>
                    </div>
                  ) : (
                    proposals.map(proposal => (
                      <div key={proposal._id || proposal.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900">{proposal.freelancer?.name || 'Freelancer'}</h4>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Match Score: {proposal.matchScore || 90}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{proposal.coverLetter}</p>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <IndianRupee className="w-4 h-4 mr-1 text-gray-500" />
                            Proposed Budget: ₹{proposal.proposedBudget}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          <button 
                            onClick={() => handleAcceptProposal(proposal._id || proposal.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" /> Accept
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'messages' && (isOwner || isAssigned) ? (
                <div className="h-[600px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <ChatWindow conversationId={project.conversationId} currentUser={user} />
                </div>
              ) : null}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <IndianRupee className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="font-medium text-gray-900">₹{project.budget?.min} - ₹{project.budget?.max}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">Estimated {project.duration || 'Flexible'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Client Info</p>
                    <p className="font-medium text-gray-900">{project.client?.name || 'Client'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
