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
  ShieldAlert,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  UserCheck,
  Eye,
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
  AreaChart,
  Area,
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stats, recentGrievances, reports, isLoading } = useSelector(
    (state) => state.dashboard
  );
  const { resolvers } = useSelector((state) => state.user);

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedResolverId, setSelectedResolverId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchReportsAnalytics());
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
          remarks: assignRemarks || 'Assigned by Administrator.',
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
      header: 'Title & Department',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            {row.department?.name || 'Department'} • Complainant: <strong>{row.complainant?.name || 'User'}</strong>
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
      width: '160px',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenAssign(row)}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="Assign or Route"
          >
            <UserCheck size={13} /> Route
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
      width: '130px',
    },
  ];

  if (isLoading && !stats.total) {
    return <LoadingSpinner fullPage message="Loading admin console..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Central Administration Console
          </h1>
          <p className="text-xs text-slate-500">
            Institutional grievance monitoring, department routing, and SLA compliance analytics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={15} /> Reports
          </button>
          <button
            type="button"
            onClick={() => navigate('/manage-grievances')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <ShieldAlert size={15} /> All Complaints ({stats.total})
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Inflow"
          value={stats.total}
          subtext="Institution-wide"
          icon={ShieldAlert}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Pending Queue"
          value={stats.pending}
          subtext="Requires routing"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtext="Being investigated"
          icon={RefreshCw}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved + stats.closed}
          subtext="Resolved / Closed"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
        <StatCard
          title="Escalated"
          value={stats.escalated}
          subtext="Requires executive eye"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend AreaChart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Grievance Inflow & Resolution Trends
            </h3>
            <span className="text-[11px] text-slate-400">Monthly breakdown</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
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
                      {val} Complaints
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSub)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution BarChart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Department Complaint Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Current Academic Term</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.departmentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val, name) => [`${val} complaints`, name === 'total' ? 'Received' : 'Resolved']}
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
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Complaints Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Active Institutional Complaint Queue
            </h2>
            <p className="text-[11px] text-slate-400">
              Recent complaints logged across all academic and administrative branches.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/manage-grievances')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage Queue ({stats.total})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentGrievances}
          keyField="_id"
          emptyTitle="No complaints in queue"
          emptyDescription="All submitted grievances have been processed."
        />
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={selectedGrievance ? `Route Grievance #${selectedGrievance.grievanceId}` : 'Assign Resolver'}
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
                Department: {selectedGrievance.department?.name} • Priority: {selectedGrievance.priority}
              </div>
            </div>

            <FormInput
              label="Designate Department Resolver"
              name="resolver"
              type="select"
              value={selectedResolverId}
              onChange={(e) => setSelectedResolverId(e.target.value)}
              placeholder="-- Select Department Resolver --"
              options={resolvers.map((r) => ({
                value: r._id,
                label: `${r.name} (${r.role.toUpperCase()}) - ${r.department?.name || 'General'}`,
              }))}
              required
              helperText="The designated resolver will immediately receive an assignment notification."
            />

            <FormInput
              label="Routing Directives / Notes"
              name="remarks"
              type="textarea"
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Specific instructions or directives for the resolver..."
              rows={3}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
