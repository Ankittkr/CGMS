import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../redux/slices/dashboardSlice.js';
import {
  updateGrievanceStatus,
  escalateGrievance,
} from '../redux/slices/grievanceSlice.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Inbox,
  Clock,
  RefreshCw,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const ResolverDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { stats, recentGrievances, isLoading } = useSelector(
    (state) => state.dashboard
  );

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleOpenUpdate = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status === 'Assigned' ? 'In Progress' : grievance.status);
    setRemarks('');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (selectedGrievance) {
      await dispatch(
        updateGrievanceStatus({
          id: selectedGrievance._id,
          status: newStatus,
          remarks,
          resolutionNotes: newStatus === 'Resolved' ? remarks : '',
        })
      );
      setIsUpdateModalOpen(false);
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
          escalateToRole: 'hod',
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
      header: 'Complaint Details',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            Student: <strong>{row.complainant?.name || 'Complainant'}</strong> ({row.complainant?.rollOrEmployeeId || 'ID'})
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
      width: '160px',
    },
    {
      header: 'Lodged',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
      width: '110px',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenUpdate(row)}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="Update Status"
          >
            <Edit3 size={12} /> Update
          </button>
          <button
            type="button"
            onClick={() => handleOpenEscalate(row)}
            className="px-2 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors cursor-pointer"
            title="Escalate to HOD"
          >
            Escalate
          </button>
          <button
            type="button"
            onClick={() => navigate(`/grievance/${row._id}`)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            title="Full View"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
      width: '190px',
    },
  ];

  if (isLoading && !stats.total) {
    return <LoadingSpinner fullPage message="Loading resolver workspace..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Department Resolver Workspace
          </h1>
          <p className="text-xs text-slate-500">
            Investigate allocated cases, record remediation milestones, and submit resolution summaries.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 shrink-0">
          Dept: {user?.department?.name || 'Department Resolver'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Complaints"
          value={stats.total}
          subtext="Under your purview"
          icon={Inbox}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Awaiting Action"
          value={stats.pending}
          subtext="Assigned / under review"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtext="Under active remediation"
          icon={RefreshCw}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved + stats.closed}
          subtext="Successfully finalized"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
      </div>

      {/* SLA Alert Strip */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span>
            <strong>Department SLA Notice:</strong> Urgent issues must receive status progression notes within 24 hours. Check queue below.
          </span>
        </div>
        <span className="font-bold text-amber-700 shrink-0">Target SLA: 95%</span>
      </div>

      {/* Assigned Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Assigned Action Queue
          </h2>
          <button
            type="button"
            onClick={() => navigate('/manage-grievances')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            All Department Complaints ({stats.total})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentGrievances}
          keyField="_id"
          emptyTitle="Your action queue is clear"
          emptyDescription="There are currently no unresolved complaints assigned to you."
        />
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={selectedGrievance ? `Update Grievance #${selectedGrievance.grievanceId}` : 'Update Status'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Save Milestone Update
            </button>
          </>
        }
      >
        {selectedGrievance && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800 mb-0.5">{selectedGrievance.title}</p>
              <p className="text-slate-600 mb-2">{selectedGrievance.description}</p>
              <div className="text-[11px] text-slate-400">
                Priority: {selectedGrievance.priority} • Lodged: {new Date(selectedGrievance.createdAt).toLocaleDateString()}
              </div>
            </div>

            <FormInput
              label="Transition Lifecycle Status"
              name="status"
              type="select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'In Progress', label: 'In Progress (Active Investigation)' },
                { value: 'Resolved', label: 'Resolved (Remediation Complete)' },
                { value: 'Under Review', label: 'Under Review (Pending Parts/Info)' },
              ]}
              required
            />

            <FormInput
              label="Resolver Remarks & Remediation Summary"
              name="remarks"
              type="textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Detail technical actions performed, replacement parts, or instructions for student..."
              required
              rows={4}
            />
          </form>
        )}
      </Modal>

      {/* Escalate Modal */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title={selectedGrievance ? `Escalate #${selectedGrievance.grievanceId} to HOD` : 'Escalate'}
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
              Escalating will transfer high-priority notification to the Department Head for administrative clearance or budget signoff.
            </p>
            <FormInput
              label="Reason for Escalation"
              name="reason"
              type="textarea"
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Specify why this cannot be resolved at staff level (e.g. budgetary approval required, policy interpretation)..."
              required
              rows={3}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ResolverDashboard;
