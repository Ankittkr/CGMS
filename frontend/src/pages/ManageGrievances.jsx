import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchGrievances,
  assignGrievance,
  updateGrievanceStatus,
} from '../redux/slices/grievanceSlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import { fetchResolvers } from '../redux/slices/userSlice.js';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  ShieldAlert,
  UserCheck,
  Edit3,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Submitted',
  'Grievance Processing',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
  'Reassigned',
  'Escalated',
];

const ManageGrievances = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role } = useSelector((state) => state.auth);
  const { grievances, isLoading } = useSelector((state) => state.grievance);
  const { departments } = useSelector((state) => state.department);
  const { resolvers } = useSelector((state) => state.user);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [selectedResolverId, setSelectedResolverId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchGrievances());
    dispatch(fetchDepartments());
    dispatch(fetchResolvers());
  }, [dispatch]);

  const filtered = grievances.filter((item) => {
    const matchesSearch =
      !search ||
      item.grievanceId?.toLowerCase().includes(search.toLowerCase()) ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.complainant?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      !deptFilter ||
      item.department?._id === deptFilter ||
      item.department?.name === deptFilter;

    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

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
          remarks: assignRemarks || `Assigned by ${role.toUpperCase()}.`,
        })
      );
      setIsAssignModalOpen(false);
      dispatch(fetchGrievances());
    }
  };

  const handleOpenStatus = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
    setStatusRemarks('');
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatus = async (e) => {
    e.preventDefault();
    if (selectedGrievance && newStatus) {
      await dispatch(
        updateGrievanceStatus({
          id: selectedGrievance._id,
          status: newStatus,
          remarks: statusRemarks,
          resolutionNotes: newStatus === 'Resolved' ? statusRemarks : '',
        })
      );
      setIsStatusModalOpen(false);
      dispatch(fetchGrievances());
    }
  };

  const canAssign = ['admin', 'hod', 'higher_authority'].includes(role);

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
            {row.department?.name} • Student: <strong>{row.complainant?.name || 'User'}</strong>
          </p>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: (row) => <PriorityBadge priority={row.priority} />,
      width: '100px',
    },
    {
      header: 'Resolver',
      accessor: (row) => (
        <span className={`text-xs ${row.assignedTo ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
          {row.assignedTo?.name || 'Unassigned'}
        </span>
      ),
      width: '140px',
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
          {canAssign && (
            <button
              type="button"
              onClick={() => handleOpenAssign(row)}
              className="px-2 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md cursor-pointer flex items-center gap-1"
              title="Assign or Route"
            >
              <UserCheck size={12} /> Route
            </button>
          )}
          <button
            type="button"
            onClick={() => handleOpenStatus(row)}
            className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer flex items-center gap-1"
            title="Update Status"
          >
            <Edit3 size={12} /> Status
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
      width: '170px',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Grievance Queue
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive complaint management, department routing, and status lifecycle updating.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer shrink-0"
        >
          <FileSpreadsheet size={14} /> Analytics & Reports
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by ID, keyword, complainant..."
        />

        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterDropdown
            label="Department"
            value={deptFilter}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
            onChange={setDeptFilter}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            options={['Low', 'Medium', 'High', 'Urgent']}
            onChange={setPriorityFilter}
          />
          {(search || deptFilter || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDeptFilter('');
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

      {isLoading ? (
        <LoadingSpinner message="Loading institutional complaints..." />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="_id"
          emptyTitle="No complaints match criteria"
          emptyDescription="Try adjusting department or status filters."
        />
      )}

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
                Department: {selectedGrievance.department?.name} • Current: {selectedGrievance.assignedTo?.name || 'Unassigned'}
              </div>
            </div>

            <FormInput
              label="Designate Department Resolver"
              name="resolver"
              type="select"
              value={selectedResolverId}
              onChange={(e) => setSelectedResolverId(e.target.value)}
              placeholder="-- Select Resolver Staff --"
              options={resolvers.map((r) => ({
                value: r._id,
                label: `${r.name} (${r.role.toUpperCase()}) - ${r.department?.name || 'General'}`,
              }))}
              required
            />

            <FormInput
              label="Directive & Remarks"
              name="remarks"
              type="textarea"
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Directive notes for the resolver..."
              rows={3}
            />
          </form>
        )}
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={selectedGrievance ? `Update #${selectedGrievance.grievanceId} Status` : 'Update'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmStatus}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              Save Status Transition
            </button>
          </>
        }
      >
        {selectedGrievance && (
          <form onSubmit={handleConfirmStatus} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800 mb-0.5">{selectedGrievance.title}</p>
              <p className="text-[11px] text-slate-500">
                Current Status: <strong>{selectedGrievance.status}</strong>
              </p>
            </div>

            <FormInput
              label="New Lifecycle Status"
              name="status"
              type="select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={STATUS_OPTIONS}
              required
            />

            <FormInput
              label="Remarks / Transition Notes"
              name="statusRemarks"
              type="textarea"
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="Provide reason for milestone transition..."
              rows={3}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageGrievances;
