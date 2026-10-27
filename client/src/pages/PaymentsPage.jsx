import React, { useState, useEffect, useContext } from 'react';
import { IndianRupee, Lock, CheckCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import { Payments } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({ totalSpent: 0, totalEarned: 0, inEscrow: 0, released: 0 });

  const filters = ['All', 'Held', 'Released', 'Refunded', 'Disputed'];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await Payments.getMyPayments();
        const paymentsList = Array.isArray(res.data) ? res.data : [];
        setPayments(paymentsList);
        // Compute stats from payments
        const held = paymentsList.filter(p => p.status === 'held').reduce((sum, p) => sum + (p.amount || 0), 0);
        const released = paymentsList.filter(p => p.status === 'released').reduce((sum, p) => sum + (p.amount || 0), 0);
        const total = paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
        setStats({ totalSpent: total, totalEarned: total, inEscrow: held, released });
      } catch (err) {
        console.error('Failed to load payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (filter === 'All') return true;
    return p.status.toLowerCase() === filter.toLowerCase();
  });

  const isClient = user?.role === 'client';

  const getStatusBadge = (status) => {
    const statusConfig = {
      held: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Lock },
      released: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCcw },
      disputed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
    };
    const config = statusConfig[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: IndianRupee };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Payments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-indigo-50 p-4 rounded-full mr-4">
            <IndianRupee className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{isClient ? 'Total Spent' : 'Total Earned'}</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{(isClient ? stats.totalSpent : stats.totalEarned)?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-amber-50 p-4 rounded-full mr-4">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Escrow</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{stats.inEscrow?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-green-50 p-4 rounded-full mr-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Released</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{stats.released?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-4 hide-scrollbar gap-2">
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

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Milestone</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{payment.project?.title || 'Unknown Project'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{payment.milestone?.title || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">₹{payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title={`No ${filter !== 'All' ? filter.toLowerCase() : ''} payments found`}
              description="There are no payment records matching this criteria."
            />
          </div>
        )}
      </div>
    </div>
  );
}
