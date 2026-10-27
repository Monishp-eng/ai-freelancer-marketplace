import React, { useState } from 'react';
import { Clock, Loader, Upload, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MilestoneTracker = ({ milestones = [], userRole, onUpdateStatus, projectId }) => {
  const [loading, setLoading] = useState(null);

  const handleUpdateStatus = async (index, newStatus) => {
    try {
      setLoading(index);
      await onUpdateStatus(index, newStatus);
      toast.success(`Milestone status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending', ring: 'ring-gray-200' };
      case 'in-progress':
        return { icon: Loader, color: 'text-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress', ring: 'ring-blue-200' };
      case 'submitted':
        return { icon: Upload, color: 'text-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Submitted', ring: 'ring-amber-200' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Approved', ring: 'ring-green-200' };
      case 'disputed':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Disputed', ring: 'ring-red-200' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending', ring: 'ring-gray-200' };
    }
  };

  if (!milestones.length) {
    return <div className="text-gray-500 text-center py-8">No milestones found.</div>;
  }

  return (
    <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
      {milestones.map((milestone, index) => {
        const statusInfo = getStatusInfo(milestone.status);
        const Icon = statusInfo.icon;
        const isCurrent = milestone.status === 'in-progress' || milestone.status === 'submitted';
        const isCompleted = milestone.status === 'approved';

        return (
          <div key={index} className="relative pl-8">
            {/* Timeline dot */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
              isCompleted ? 'border-green-500 bg-green-500' :
              isCurrent ? `border-${statusInfo.color.split('-')[1]}-500 ring-4 ${statusInfo.ring}` :
              'border-gray-300'
            }`} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{milestone.title}</h4>
                  <div className="flex items-center gap-3 mt-1.5 text-sm">
                    <span className="font-medium text-gray-900">₹{milestone.amount?.toFixed(2)}</span>
                    {milestone.dueDate && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-5">{milestone.description}</p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {userRole === 'freelancer' && (
                  <>
                    {milestone.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(index, 'in-progress')}
                        disabled={loading === index}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
                      >
                        {loading === index ? 'Updating...' : 'Start Work'}
                      </button>
                    )}
                    {milestone.status === 'in-progress' && (
                      <button 
                        onClick={() => handleUpdateStatus(index, 'submitted')}
                        disabled={loading === index}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
                      >
                        {loading === index ? 'Updating...' : 'Submit Deliverable'}
                      </button>
                    )}
                  </>
                )}

                {userRole === 'client' && milestone.status === 'submitted' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(index, 'approved')}
                      disabled={loading === index}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
                    >
                      {loading === index ? 'Updating...' : 'Approve & Release'}
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(index, 'disputed')}
                      disabled={loading === index}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-red-600 rounded-xl px-5 py-2 text-sm font-medium transition-colors"
                    >
                      Dispute
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneTracker;
