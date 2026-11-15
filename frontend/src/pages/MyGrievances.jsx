import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGrievances } from '../redux/slices/grievanceSlice.js';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { PlusCircle, Eye } from 'lucide-react';

const MyGrievances = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { grievances, isLoading } = useSelector((state) => state.grievance);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    dispatch(fetchGrievances());
  }, [dispatch]);

  const filtered = grievances.filter((item) => {
    const matchesSearch =
      !search ||
      item.grievanceId?.toLowerCase().includes(search.toLowerCase()) ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      header: 'Subject & Category',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400">
            {row.category?.name} • {row.department?.name}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Lodged Grievances
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time progress, review resolver updates, and inspect lifecycle audit trails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/submit-grievance')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle size={15} /> Lodge New Complaint
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by ID or keywords..."
        />

        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={[
              'Submitted',
              'Grievance Processing',
              'Under Review',
              'Assigned',
              'In Progress',
              'Resolved',
              'Closed',
              'Reopened',
              'Escalated',
            ]}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            options={['Low', 'Medium', 'High', 'Urgent']}
            onChange={setPriorityFilter}
          />
          {(search || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-blue-600 hover:underline px-2 py-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching your complaints..." />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="_id"
          emptyTitle="No matching grievances found"
          emptyDescription="Try clearing your search query or filters to display your complaints."
        />
      )}
    </div>
  );
};

export default MyGrievances;
