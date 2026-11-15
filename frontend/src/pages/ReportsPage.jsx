import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportsAnalytics } from '../redux/slices/dashboardSlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import StatCard from '../components/StatCard.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calendar,
  Building2,
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const STATUS_COLORS = {
  Submitted: '#64748b',
  'Grievance Processing': '#0284c7',
  'Under Review': '#f59e0b',
  Assigned: '#8b5cf6',
  'In Progress': '#2563eb',
  Resolved: '#10b981',
  Closed: '#059669',
  Reopened: '#e11d48',
  Escalated: '#dc2626',
};

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { reports, isLoading } = useSelector((state) => state.dashboard);
  const { departments } = useSelector((state) => state.department);

  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    dispatch(fetchReportsAnalytics(selectedDept ? { department: selectedDept } : {}));
    dispatch(fetchDepartments());
  }, [dispatch, selectedDept]);

  const handleExportCSV = () => {
    if (!reports.departmentDistribution || reports.departmentDistribution.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['Department', 'Code', 'Total Complaints Lodged', 'Complaints Resolved', 'Resolution Rate (%)'];
    const rows = reports.departmentDistribution.map((d) => [
      `"${d.department}"`,
      d.code,
      d.total,
      d.resolved,
      d.total > 0 ? ((d.resolved / d.total) * 100).toFixed(1) : '100',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CGMS_Department_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusPieData = (reports.statusCounts || []).map((s) => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  const fallbackPie = [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Grievance Analytics & SLA Compliance Reports
          </h1>
          <p className="text-xs text-slate-500">
            Institutional turnaround times, department SLA compliance rates, and resolution audit metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <Download size={14} /> Export CSV Audit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Turnaround"
          value="32.4 hrs"
          subtext="Institutional Target: < 48 hrs"
          icon={Clock}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isPositive
        />
        <StatCard
          title="SLA Compliance Rate"
          value="94.2%"
          subtext="+2.8% vs last evaluation"
          icon={ShieldCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          isPositive
        />
        <StatCard
          title="Escalation Rate"
          value="3.8%"
          subtext="-1.2% reduction in disputes"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          isPositive
        />
        <StatCard
          title="Resolution Satisfaction"
          value="4.7 / 5.0"
          subtext="Based on student feedback"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          isPositive
        />
      </div>

      {/* Department Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar size={15} className="text-slate-400" />
          <span>Reporting Scope:</span>
        </div>

        <FilterDropdown
          label="Department"
          value={selectedDept}
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
          onChange={setSelectedDept}
          allLabel="All College Departments"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Resolution Comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Department Complaint vs Resolution Volume
            </h3>
            <span className="text-[11px] text-slate-400">Live MongoDB Aggregation</span>
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
                  formatter={(v) => (
                    <span className="text-xs text-slate-600 font-medium capitalize">
                      {v === 'total' ? 'Lodged' : 'Resolved'}
                    </span>
                  )}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-600" />
              Institutional Resolution Status Distribution
            </h3>
            <span className="text-[11px] text-slate-400">All Active Cases</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData.length > 0 ? statusPieData : fallbackPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(statusPieData.length > 0 ? statusPieData : fallbackPie).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Cases`, name]}
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
                  formatter={(v) => (
                    <span className="text-xs text-slate-600 font-medium">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend AreaChart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            Monthly Complaint Inflow vs Resolution Trends
          </h3>
          <span className="text-[11px] text-slate-400">Past 6 Months</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reports.monthlyTrends || []}>
              <defs>
                <linearGradient id="colorSubReport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResReport" x1="0" y1="0" x2="0" y2="1">
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
                    {val === 'submitted' ? 'Complaints Lodged' : 'Complaints Resolved'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSubReport)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResReport)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
