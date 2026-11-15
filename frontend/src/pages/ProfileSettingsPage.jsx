import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateUserProfile,
  changeUserPassword,
} from '../redux/slices/authSlice.js';
import FormInput from '../components/FormInput.jsx';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfileSettingsPage = () => {
  const dispatch = useDispatch();
  const { user, role, isLoading } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUserProfile({ name, phone }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.payload || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    const result = await dispatch(
      changeUserPassword({ currentPassword, newPassword })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.payload || 'Failed to change password.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          User Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your contact credentials, institutional particulars, and portal security password.
        </p>
      </div>

      {/* Profile Particulars */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          Institutional Particulars
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormInput
              label="Contact Phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Institutional Email"
              name="email"
              value={user?.email || ''}
              disabled
            />
            <FormInput
              label="Roll No / Employee ID"
              name="id"
              value={user?.rollOrEmployeeId || ''}
              disabled
            />
            <FormInput
              label="Designated Role"
              name="role"
              value={role?.replace('_', ' ').toUpperCase() || 'STUDENT'}
              disabled
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security Password Change */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
          <Lock size={16} className="text-blue-600" />
          Change Account Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <FormInput
            label="Current Password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={14} /> Update Security Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
