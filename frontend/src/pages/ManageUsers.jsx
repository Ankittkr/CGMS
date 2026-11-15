import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  updateUserRole,
  toggleUserStatus,
} from '../redux/slices/userSlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import DataTable from '../components/DataTable.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Users, UserCheck, Shield, Power } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student / Complainant' },
  { value: 'resolver', label: 'Department Staff / Resolver' },
  { value: 'hod', label: 'HOD / Department Authority' },
  { value: 'admin', label: 'Administrator' },
  { value: 'higher_authority', label: 'Higher Authority' },
];

const ManageUsers = () => {
  const dispatch = useDispatch();

  const { users, isLoading } = useSelector((state) => state.user);
  const { departments } = useSelector((state) => state.department);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('student');
  const [targetDept, setTargetDept] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.rollOrEmployeeId?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesDept =
      !deptFilter ||
      u.department?._id === deptFilter ||
      u.department?.name === deptFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const handleOpenEditRole = (user) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setTargetDept(user.department?._id || user.department || '');
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      await dispatch(
        updateUserRole({
          id: selectedUser._id,
          role: targetRole,
          department: targetDept || null,
        })
      );
      setIsRoleModalOpen(false);
      dispatch(fetchUsers());
    }
  };

  const handleToggleStatus = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}'s account?`)) {
      await dispatch(toggleUserStatus(user._id));
      dispatch(fetchUsers());
    }
  };

  const columns = [
    {
      header: 'ID / Roll No',
      accessor: (row) => (
        <span className="font-mono font-bold text-blue-600">
          {row.rollOrEmployeeId}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Name & Email',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: (row) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700 border border-slate-200">
          {row.role?.replace('_', ' ')}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Department',
      accessor: (row) => row.department?.name || 'General / Central',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold ${
            row.isActive ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.isActive ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '110px',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditRole(row)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors"
          >
            Edit Role
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={`p-1 rounded cursor-pointer ${
              row.isActive
                ? 'text-red-500 hover:bg-red-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.isActive ? 'Deactivate user' : 'Activate user'}
          >
            <Power size={14} />
          </button>
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          User Account & Role Management
        </h1>
        <p className="text-xs text-slate-500">
          Manage institutional members, assign departmental resolver roles, and monitor account access status.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, roll no..."
        />

        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterDropdown
            label="Role"
            value={roleFilter}
            options={ROLE_OPTIONS}
            onChange={setRoleFilter}
          />
          <FilterDropdown
            label="Department"
            value={deptFilter}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
            onChange={setDeptFilter}
          />
          {(search || roleFilter || deptFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setDeptFilter('');
              }}
              className="text-xs text-blue-600 hover:underline px-2 py-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="_id"
          emptyTitle="No users found"
          emptyDescription="Try adjusting search or role filters."
        />
      )}

      {/* Edit Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={selectedUser ? `Edit Role • ${selectedUser.name}` : 'Edit Role'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRole}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              Save Role Permissions
            </button>
          </>
        }
      >
        {selectedUser && (
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800">{selectedUser.name}</p>
              <p className="text-slate-500">{selectedUser.email} • {selectedUser.rollOrEmployeeId}</p>
            </div>

            <FormInput
              label="Assigned System Role"
              name="role"
              type="select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              options={ROLE_OPTIONS}
              required
            />

            <FormInput
              label="Assigned Academic / Administrative Department"
              name="department"
              type="select"
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              placeholder="-- Select Department --"
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
