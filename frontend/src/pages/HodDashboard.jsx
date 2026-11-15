import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchDashboardStats,
  fetchReportsAnalytics,
} from '../redux/slices/dashboardSlice.js';
import {
  assignGrievance,
  escalateGrievance,
} from '../redux/slices/grievanceSlice.js';
import { fetchResolvers } from '../redux/slices/userSlice.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Award,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

const HodDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { stats, recentGrievances, isLoading } = useSelector(
    (state) => state.dashboard
  );
  const { resolvers } = useSelector((state) => state.user);

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedResolverId, setSelectedResolverId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchResolvers());
  }, [dispatch]);

  const handleOpenAssign = (grievance) => {
    setSelectedGrievance(grievance);
    setSelectedResolverId(grievance.assignedTo?._id || '');
    setAssignRemarks('');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (selectedGrievance && selectedResolverId) {
      await dispatch(
        assignGrievance({
          id: selectedGrievance._id,
          resolverId: selectedResolverId,
          remarks: assignRemarks || 'Reassigned by Department HOD.',
        })
      );
      setIsAssignModalOpen(false);
      dispatch(fetchDashboardStats());
    }
  };

  const handleOpenEscalate = (grievance) => {
    setSelectedGrievance(grievance);
    setEscalateReason('');
    setIsEscalateModalOpen(true);
  };

  const handleConfirmEscalate = async (e) => {
    e.preventDefault();
    if (selectedGrievance) {
      await dispatch(
        escalateGrievance({
          id: selectedGrievance._id,
          escalateToRole: 'higher_authority',
          reason: escalateReason,
        })
      );
      setIsEscalateModalOpen(false);
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
      header: 'Complaint & Complainant',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            Student: <strong>{row.complainant?.name}</strong> • Category: {row.category?.name}
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
      header: 'Assigned Resolver',
      accessor: (row) => (
        <span className={`text-xs ${row.assignedTo ? 'font-medium text-slate-800' : 'text-slate-400 italic'}`}>
          {row.assignedTo?.name || 'Unassigned'}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      width: '150px',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenAssign(row)}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="Reassign Resolver"
          >
            <UserCheck size={12} /> Assign
          </button>
          <button
            type="button"
            onClick={() => handleOpenEscalate(row)}
            className="px-2 py-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors cursor-pointer"
            title="Escalate to Higher Authority"
          >
            Escalate
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
      width: '190px',
    },
  ];

  if (isLoading && !stats.total) {
    return <LoadingSpinner fullPage message="Loading HOD console..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            HOD Department Console
          </h1>
          <p className="text-xs text-slate-500">
            Department oversight, resolver staff performance monitoring, and escalation review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Dept Reports
          </button>
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 shrink-0">
            Lead: {user?.department?.name || 'Department'}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Dept Complaints"
          value={stats.total}
          subtext="Total departmental cases"
          icon={Award}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Pending / Review"
          value={stats.pending}
          subtext="Awaiting staff action"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Under Resolution"
          value={stats.inProgress}
          subtext="Active remediation"
          icon={RefreshCw}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Resolved Cases"
          value={stats.resolved + stats.closed}
          subtext="Resolved / Closed"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
        <StatCard
          title="Escalations"
          value={stats.escalated}
          subtext="Requiring executive action"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Department Complaints & Staff Supervision
          </h2>
          <button
            type="button"
            onClick={() => navigate('/manage-grievances')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All ({stats.total})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentGrievances}
          keyField="_id"
          emptyTitle="No departmental complaints"
          emptyDescription="There are currently no active complaints for your department."
        />
      </div>

      {/* Reassign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={selectedGrievance ? `Reassign Grievance #${selectedGrievance.grievanceId}` : 'Assign Resolver'}
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
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </>
        }
      >
        {selectedGrievance && (
          <form onSubmit={handleConfirmAssign} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800 mb-0.5">{selectedGrievance.title}</p>
              <div className="text-[11px] text-slate-500">
                Current Resolver: {selectedGrievance.assignedTo?.name || 'Unassigned'}
              </div>
            </div>

            <FormInput
              label="Designate Staff Resolver"
              name="resolver"
              type="select"
              value={selectedResolverId}
              onChange={(e) => setSelectedResolverId(e.target.value)}
              placeholder="-- Select Staff Member --"
              options={resolvers.map((r) => ({
                value: r._id,
                label: `${r.name} (${r.rollOrEmployeeId})`,
              }))}
              required
            />

            <FormInput
              label="HOD Directives"
              name="remarks"
              type="textarea"
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Directives for remediation turnaround..."
              rows={3}
            />
          </form>
        )}
      </Modal>

      {/* Escalate to Higher Authority Modal */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title={selectedGrievance ? `Escalate #${selectedGrievance.grievanceId} to Higher Authority` : 'Escalate'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmEscalate}
              disabled={!escalateReason}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              Confirm Escalation
            </button>
          </>
        }
      >
        {selectedGrievance && (
          <form onSubmit={handleConfirmEscalate} className="space-y-4">
            <p className="text-xs text-slate-600">
              Escalating to the Principal / Dean Office initiates high-level institutional review.
            </p>
            <FormInput
              label="Official Justification for Escalation"
              name="reason"
              type="textarea"
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Explain policy, structural, or financial constraints requiring higher management intervention..."
              required
              rows={3}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HodDashboard;
