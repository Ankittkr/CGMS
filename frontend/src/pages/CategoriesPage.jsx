import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
} from '../redux/slices/categorySlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { FolderTree, Plus, Edit3 } from 'lucide-react';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.category);
  const { departments } = useSelector((state) => state.department);
  const { role } = useSelector((state) => state.auth);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    slaHours: 48,
    priorityDefault: 'Medium',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      department: departments[0]?._id || '',
      slaHours: 48,
      priorityDefault: 'Medium',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createCategory(formData));
    setIsAddModalOpen(false);
    dispatch(fetchCategories());
  };

  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setFormData({
      name: cat.name,
      department: cat.department?._id || cat.department,
      slaHours: cat.slaHours,
      priorityDefault: cat.priorityDefault,
      description: cat.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedCat) {
      await dispatch(
        updateCategory({
          id: selectedCat._id,
          ...formData,
        })
      );
      setIsEditModalOpen(false);
      dispatch(fetchCategories());
    }
  };

  const canManage = ['admin', 'hod'].includes(role);

  const columns = [
    {
      header: 'Category Name',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      header: 'Department Responsible',
      accessor: (row) => row.department?.name || 'Central',
    },
    {
      header: 'Resolution SLA',
      accessor: (row) => (
        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
          {row.slaHours} Hours
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Default Urgency',
      accessor: (row) => <PriorityBadge priority={row.priorityDefault} />,
      width: '130px',
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
            Grievance Categories & SLA Matrices
          </h1>
          <p className="text-xs text-slate-500">
            Define institutional dispute categories, default priority levels, and mandatory turnaround time limits.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={15} /> Add Category
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          keyField="_id"
          emptyTitle="No categories configured"
          emptyDescription="Click 'Add Category' to define dispute categories and SLA response targets."
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
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
              Create Category
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Hostel Wi-Fi & Internet Connectivity"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
              required
            />

            <FormInput
              label="SLA Turnaround (Hours)"
              name="slaHours"
              type="number"
              value={formData.slaHours}
              onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
              required
            />
          </div>

          <FormInput
            label="Default Urgency"
            name="priorityDefault"
            type="select"
            value={formData.priorityDefault}
            onChange={(e) => setFormData({ ...formData, priorityDefault: e.target.value })}
            options={['Low', 'Medium', 'High', 'Urgent']}
            required
          />

          <FormInput
            label="Description & Guidance"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedCat ? `Edit Category • ${selectedCat.name}` : 'Edit'}
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
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
              required
            />

            <FormInput
              label="SLA Turnaround (Hours)"
              name="slaHours"
              type="number"
              value={formData.slaHours}
              onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
              required
            />
          </div>

          <FormInput
            label="Default Urgency"
            name="priorityDefault"
            type="select"
            value={formData.priorityDefault}
            onChange={(e) => setFormData({ ...formData, priorityDefault: e.target.value })}
            options={['Low', 'Medium', 'High', 'Urgent']}
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

export default CategoriesPage;
