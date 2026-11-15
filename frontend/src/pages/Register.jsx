import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearAuthError } from '../redux/slices/authSlice.js';
import { fetchDepartments } from '../redux/slices/departmentSlice.js';
import FormInput from '../components/FormInput.jsx';
import { UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, role, isLoading, error } = useSelector(
    (state) => state.auth
  );
  const { departments } = useSelector((state) => state.department);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollOrEmployeeId: '',
    department: '',
    role: 'student',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });

  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'student') navigate('/student-dashboard');
      else if (role === 'resolver') navigate('/resolver-dashboard');
      else navigate('/admin-dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (!formData.agreeTerms) {
      setLocalError('Please accept the institutional terms.');
      return;
    }

    dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department || undefined,
        rollOrEmployeeId: formData.rollOrEmployeeId,
        phone: formData.phone,
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-slate-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            C
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Complainant Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create your account to lodge and track grievances with college authorities.
          </p>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {localError || (typeof error === 'string' ? error : 'Registration failed.')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Ankit Kumar"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Institutional Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rollno@college.edu"
              required
            />
            <FormInput
              label="Roll No / Employee ID"
              name="rollOrEmployeeId"
              value={formData.rollOrEmployeeId}
              onChange={handleChange}
              placeholder="e.g., 2026-CSE-042"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Academic Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              placeholder="-- Select Department --"
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <span>
                I agree to the University Grievance Regulations and confirm that submissions made are legitimate.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
