import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchDashboardStats,
  fetchReportsAnalytics,
} from '../redux/slices/dashboardSlice.js';
import { assignGrievance } from '../redux/slices/grievanceSlice.js';
import { fetchResolvers } from '../redux/slices/userSlice.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Crown,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  UserCheck,
  Eye,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HigherAuthorityDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stats, recentGrievances, reports, isLoading } = useSelector(
    (state) => state.dashboard
  );
  const { resolvers } = useSelector((state) => state.user);

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedResolverId, setSelectedResolverId] = useState('');
  const [executiveDirective, setExecutiveDirective] = useState('');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchReportsAnalytics());
    dispatch(fetchResolvers());
  }, [dispatch]);

  const handleOpenAssign = (grievance) => {
    setSelectedGrievance(grievance);
    setSelectedResolverId(grievance.assignedTo?._id || '');
    setExecutiveDirective('');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (selectedGrievance && selectedResolverId) {
      await dispatch(
        assignGrievance({
          id: selectedGrievance._id,
          resolverId: selectedResolverId,
          remarks: `Executive directive from Dean/Principal: ${executiveDirective}`,
        })
      );
      setIsAssignModalOpen(false);
      dispatch(fetchDashboardStats());
    }
  };

  const columns = [
    {
      header: 'Complaint ID',
      accessor: (row) => (
        <span className="font-mono font-bold text-blue-600">
          {row.grievanceId}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Subject & Department',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            {row.department?.name} • Student: <strong>{row.complainant?.name}</strong>
          </p>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: (row) => <PriorityBadge priority={row.priority} />,
      width: '110px',
    },
    {
      header: 'Current Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      width: '150px',
    },
    {
      header: 'Escalation Reason',
      accessor: (row) => (
        <span className="text-xs text-red-700 italic line-clamp-1">
          {row.escalatedTo?.reason || 'Standard high-priority oversight'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenAssign(row)}
            className="px-2.5 py-1 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
          >
            <UserCheck size={12} /> Direct
          </button>
          <button
            type="button"
            onClick={() => navigate(`/grievance/${row._id}`)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
      width: '130px',
    },
  ];

  if (isLoading && !stats.total) {
    return <LoadingSpinner fullPage message="Loading executive oversight console..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Crown size={22} className="text-purple-600" />
            Executive Authority Oversight (Dean / Principal Desk)
          </h1>
          <p className="text-xs text-slate-500">
            High-level institutional review, escalated dispute resolutions, and campus-wide governance analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Full Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Escalated Cases"
          value={stats.escalated}
          subtext="Urgent management review"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          title="Total Campus Inflow"
          value={stats.total}
          subtext="All active departments"
          icon={Crown}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtext="Under active remediation"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Campus Resolved"
          value={stats.resolved + stats.closed}
          subtext="92% SLA adherence"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
      </div>

      {/* Department Summary Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={16} className="text-purple-600" />
            Institutional Department Resolution Rate
          </h3>
          <span className="text-[11px] text-slate-400">Total vs Resolved</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reports.departmentDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(val) => (
                  <span className="text-xs text-slate-600 font-medium capitalize">
                    {val === 'total' ? 'Complaints Lodged' : 'Complaints Resolved'}
                  </span>
                )}
              />
              <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Escalated Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Complaints Requiring Executive Review
          </h2>
          <button
            type="button"
            onClick={() => navigate('/manage-grievances')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            All Institutional Cases ({stats.total})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentGrievances}
          keyField="_id"
          emptyTitle="No escalated complaints"
          emptyDescription="All escalated issues have been addressed."
        />
      </div>

      {/* Executive Directive Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={selectedGrievance ? `Executive Directive • #${selectedGrievance.grievanceId}` : 'Directive'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAssign}
              disabled={!selectedResolverId}
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              Issue Directive
            </button>
          </>
        }
      >
        {selectedGrievance && (
          <form onSubmit={handleConfirmAssign} className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs">
              <p className="font-bold text-purple-900 mb-0.5">{selectedGrievance.title}</p>
              <p className="text-purple-700 text-[11px] mb-2">{selectedGrievance.description}</p>
              <div className="text-[10px] text-purple-600 font-semibold uppercase">
                Escalation Note: {selectedGrievance.escalatedTo?.reason || 'None specified'}
              </div>
            </div>

            <FormInput
              label="Designate Authority / Senior Resolver"
              name="resolver"
              type="select"
              value={selectedResolverId}
              onChange={(e) => setSelectedResolverId(e.target.value)}
              placeholder="-- Select Senior Incharge --"
              options={resolvers.map((r) => ({
                value: r._id,
                label: `${r.name} (${r.role.toUpperCase()}) - ${r.department?.name || 'College'}`,
              }))}
              required
            />

            <FormInput
              label="Executive Order / Mandated Turnaround Directive"
              name="directive"
              type="textarea"
              value={executiveDirective}
              onChange={(e) => setExecutiveDirective(e.target.value)}
              placeholder="Specify immediate resolution action, emergency budget grant, or student hearing mandate..."
              required
              rows={3}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HigherAuthorityDashboard;
