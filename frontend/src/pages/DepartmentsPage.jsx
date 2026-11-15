import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
} from '../redux/slices/departmentSlice.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Building2, Plus, Edit3 } from 'lucide-react';

const DepartmentsPage = () => {
  const dispatch = useDispatch();
  const { departments, isLoading } = useSelector((state) => state.department);
  const { role } = useSelector((state) => state.auth);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setFormData({ name: '', code: '', description: '' });
    setIsAddModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createDepartment(formData));
    setIsAddModalOpen(false);
    dispatch(fetchDepartments());
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedDept) {
      await dispatch(
        updateDepartment({
          id: selectedDept._id,
          name: formData.name,
          code: formData.code,
          description: formData.description,
        })
      );
      setIsEditModalOpen(false);
      dispatch(fetchDepartments());
    }
  };

  const canManage = role === 'admin';

  const columns = [
    {
      header: 'Department Code',
      accessor: (row) => (
        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.code}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Department Name',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      header: 'Description',
      accessor: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1">
          {row.description || 'No description provided.'}
        </span>
      ),
    },
    {
      header: 'HOD / Incharge',
      accessor: (row) => row.hod?.name || 'Unassigned',
      width: '180px',
    },
    ...(canManage
      ? [
          {
            header: 'Action',
            accessor: (row) => (
              <button
                type="button"
                onClick={() => handleOpenEdit(row)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit
              </button>
            ),
            width: '100px',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic & Administrative Departments
          </h1>
          <p className="text-xs text-slate-500">
            Configure institutional branches, designated departmental leads, and grievance routing rules.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={15} /> Add Department
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          keyField="_id"
          emptyTitle="No departments found"
          emptyDescription="Click 'Add Department' to configure academic units."
        />
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Department"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              Create Department
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Electrical & Electronics Engineering"
            required
          />

          <FormInput
            label="Department Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., EEE"
            required
          />

          <FormInput
            label="Description & Scope"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Scope of student grievances handled by this department..."
            rows={3}
          />
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedDept ? `Edit Department • ${selectedDept.name}` : 'Edit'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormInput
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <FormInput
            label="Department Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />

          <FormInput
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
