import React, { useState, useEffect ,useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitGrievance, clearGrievanceSuccess } from '../redux/slices/grievanceSlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import { fetchCategories } from '../redux/slices/categorySlice.js';
import FormInput from '../components/FormInput.jsx';
import {
  FilePlus2,
  UploadCloud,
  CheckCircle2,
  Shield,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

const SubmitGrievance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { departments } = useSelector((state) => state.department);
  const { categories } = useSelector((state) => state.category);
  const { isSubmitting, error, successMessage } = useSelector(
    (state) => state.grievance
  );

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    category: '',
    priority: 'Medium',
    description: '',
    declaration: false,
  });

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [createdGrievance, setCreatedGrievance] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(clearGrievanceSuccess());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-select department if category is chosen
    if (name === 'category') {
      const selectedCat = categories.find((c) => c._id === value);
      if (selectedCat && selectedCat.department) {
        setFormData((prev) => ({
          ...prev,
          category: value,
          department: selectedCat.department._id || selectedCat.department,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration) {
      alert('Please confirm the institutional declaration.');
      return;
    }

    const payload = new FormData();

    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('department', formData.department);
    payload.append('category', formData.category);
    payload.append('priority', formData.priority);

    // Append actual files
    attachments.forEach((file) => {
      payload.append('attachments', file);
    });

    const result = await dispatch(submitGrievance(payload));

    if (result.meta.requestStatus === 'fulfilled') {
      setCreatedGrievance(result.payload);
    }
  };
  
  const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);

  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
  ];

  const validFiles = [];

  for (const file of selectedFiles) {
    if (!allowedTypes.includes(file.type)) {
      alert(`${file.name}: Only PDF, PNG and JPG files are allowed.`);
      continue;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert(`${file.name}: File size must not exceed 15MB.`);
      continue;
    }

    validFiles.push(file);
  }

  setAttachments((prev) => {
    const remainingSlots = 5 - prev.length;

    if (validFiles.length > remainingSlots) {
      alert('You can upload a maximum of 5 attachments.');
    }

    return [...prev, ...validFiles.slice(0, remainingSlots)];
  });

  // Allow selecting the same file again
  e.target.value = '';
  };

const removeAttachment = (index) => {
  setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (createdGrievance) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto my-10 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Complaint Successfully Lodged!
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Your complaint has been encrypted and recorded into the institutional ledger under:
        </p>
        <div className="inline-block px-5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-lg font-mono font-bold text-blue-700 mb-6">
          {createdGrievance.grievanceId}
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          An automated acknowledgment has been logged. You will receive real-time notifications as designated department authorities review and process this complaint.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCreatedGrievance(null);
              setFormData({
                title: '',
                department: '',
                category: '',
                priority: 'Medium',
                description: '',
                declaration: false,
              });
              setAttachments([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Lodge Another
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-grievances')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Track in My Grievances <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Lodge an Institutional Grievance
        </h1>
        <p className="text-xs text-slate-500">
          Provide accurate details to ensure routing to the correct department authority and resolver cell.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {typeof error === 'string' ? error : 'Failed to submit grievance.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identification Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Complainant: </span>
              <strong className="text-slate-800">{user?.name}</strong> ({user?.rollOrEmployeeId})
            </div>
            <div>
              <span className="text-slate-400">Department: </span>
              <strong className="text-slate-800">{user?.department?.name || 'General Student'}</strong>
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              <Shield size={14} /> Confidential & SLA Protected
            </div>
          </div>

          {/* Title */}
          <FormInput
            label="Grievance Subject / Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Computing Lab 4 High-Performance Server Down"
            required
            helperText="Provide a clear, descriptive title summarizing the primary issue."
          />

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Grievance Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              placeholder="-- Select Category --"
              options={categories.map((c) => ({
                value: c._id,
                label: `${c.name} (${c.slaHours}h SLA)`,
              }))}
              required
            />

            <FormInput
              label="Target Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              placeholder="-- Select Department --"
              options={departments.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Priority Urgency Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    formData.priority === p
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={formData.priority === p}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />
                  {p}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Urgent issues (e.g. electrical hazards, hall ticket errors) dispatch automatic 24-hr escalation notifications.
            </p>
          </div>

          {/* Description */}
          <FormInput
            label="Detailed Statement of Grievance"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the incident including exact room/lab location, error codes, previous informal attempts made, or dates..."
            required
            rows={5}
          />

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supporting Evidence / Documents (Optional)
            </label>

            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-colors cursor-pointer block">
              <UploadCloud size={30} className="mx-auto text-slate-400 mb-2" />

              <p className="text-xs font-semibold text-slate-700">
                Click to upload screenshots, receipts or documents
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                PDF, PNG, JPG | Maximum 15MB per file | Up to 5 files
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Selected Files */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FilePlus2 size={16} className="text-blue-600 shrink-0" />

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Declaration */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <span>
                I hereby declare that the facts stated above are accurate and lodged in good faith for institutional remediation.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.declaration}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <FileCheck size={16} />
              {isSubmitting ? 'Recording Grievance...' : 'Submit Institutional Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitGrievance;
