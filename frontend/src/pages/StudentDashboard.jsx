import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../redux/slices/dashboardSlice.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  PlusCircle,
  Eye,
  TrendingUp,
  PieChart as PieIcon,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { stats, recentGrievances, isLoading } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const pieData = [
    { name: 'Pending Review', value: Math.max(0, stats.pending || 0), color: '#f59e0b' },
    { name: 'In Progress', value: Math.max(0, stats.inProgress || 0), color: '#3b82f6' },
    { name: 'Resolved', value: Math.max(0, stats.resolved || 0), color: '#10b981' },
    { name: 'Closed', value: Math.max(0, stats.closed || 0), color: '#64748b' },
  ].filter((item) => item.value > 0);

  const fallbackPie = [{ name: 'No Active Cases', value: 1, color: '#e2e8f0' }];

  const columns = [
    {
      header: 'Complaint ID',
      accessor: (row) => (
        <span className="font-mono font-bold text-blue-600">
          {row.grievanceId}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Title & Category',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            {row.category?.name || 'General'} • {row.department?.name || 'Department'}
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
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      width: '160px',
    },
    {
      header: 'Lodged On',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
      width: '120px',
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/grievance/${row._id}`)}
          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
        >
          <Eye size={13} /> View
        </button>
      ),
      width: '90px',
    },
  ];

  if (isLoading && !stats.total) {
    return <LoadingSpinner fullPage message="Loading student dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="text-xs text-slate-500">
            Lodge complaints, monitor resolver progression, and inspect lifecycle audit trails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/submit-grievance')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle size={16} /> Lodge New Complaint
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          subtext="Lifetime submissions"
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          subtext="Awaiting initial assessment"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtext="Under active resolution"
          icon={RefreshCw}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Resolved Cases"
          value={stats.resolved + stats.closed}
          subtext="Successfully finalized"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
      </div>

      {/* Grid: Status Chart & SLA Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieIcon size={16} className="text-blue-600" />
              Grievance Status Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Real-time status</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : fallbackPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(pieData.length > 0 ? pieData : fallbackPie).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Grievance(s)`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(val) => (
                    <span className="text-xs text-slate-600 font-medium">{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institutional Guidelines */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Institutional SLA & Redressal Protocol
              </h3>
              <span className="text-[11px] text-slate-400">Regulations</span>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <p>
                  <strong>Encrypted Tracking ID:</strong> Every lodging receives a timestamped institutional complaint ID for transparent auditing.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <p>
                  <strong>SLA Timeframes:</strong> Standard grievances are assigned within 24h and resolved according to category SLA matrices.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </div>
                <p>
                  <strong>Reopen Protection:</strong> If resolution is incomplete, students may reopen within 7 calendar days with supporting notes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need assistance? Check alerts or reach Student Affairs.
            </span>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Alerts Hub
            </button>
          </div>
        </div>
      </div>

      {/* Recent Grievances Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Recent Lodged Complaints
          </h2>
          <button
            type="button"
            onClick={() => navigate('/my-grievances')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All ({stats.total})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentGrievances}
          keyField="_id"
          emptyTitle="No complaints lodged yet"
          emptyDescription="You haven't submitted any complaints yet. Click 'Lodge New Complaint' to submit one."
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
