import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser, setDemoRole } from '../redux/slices/authSlice.js';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  ShieldCheck,
  GraduationCap,
  Wrench,
  Award,
  Crown,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard': 'Grievance Redressal Dashboard',
  '/student-dashboard': 'Student Grievance Dashboard',
  '/resolver-dashboard': 'Department Resolver Workspace',
  '/hod-dashboard': 'HOD Department Console',
  '/admin-dashboard': 'Central Administration Console',
  '/higher-authority-dashboard': 'Executive Authority Oversight',
  '/submit-grievance': 'Lodge New Institutional Complaint',
  '/my-grievances': 'My Grievance Lodgings & Status',
  '/manage-grievances': 'Institutional Grievance Management',
  '/manage-users': 'User Account & Role Management',
  '/departments': 'Academic & Administrative Departments',
  '/categories': 'Grievance Categories & SLA Matrices',
  '/notifications': 'Notification & Alerts Hub',
  '/reports': 'Institutional Grievance Analytics & SLA Reports',
  '/profile': 'User Profile & Security Preferences',
};

const ROLE_DISPLAY = {
  student: { label: 'Student', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  resolver: { label: 'Resolver', icon: Wrench, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  hod: { label: 'HOD', icon: Award, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  higher_authority: { label: 'Higher Authority', icon: Crown, color: 'text-purple-700 bg-purple-50 border-purple-200' },
};

const Navbar = ({ onToggleSidebar, onToggleNotifications }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const currentTitle =
    ROUTE_TITLES[location.pathname] || 'Complaint & Grievance Portal';

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleRoleSwitch = (newRole) => {
    dispatch(setDemoRole(newRole));
    if (newRole === 'student') navigate('/student-dashboard');
    else if (newRole === 'resolver') navigate('/resolver-dashboard');
    else if (newRole === 'hod') navigate('/hod-dashboard');
    else if (newRole === 'higher_authority') navigate('/higher-authority-dashboard');
    else navigate('/admin-dashboard');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const currentRoleConfig = ROLE_DISPLAY[role] || ROLE_DISPLAY.student;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            {currentTitle}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            College Grievance Redressal & Resolution System
          </p>
        </div>
      </div>

      {/* Right Actions: Role switcher pill, notification bell, profile */}
      <div className="flex items-center gap-3">

        {/* Current Active Role Badge for smaller viewports */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentRoleConfig.color}`}
        >
          <RoleIcon size={13} />
          <span>{currentRoleConfig.label}</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'Authorized Member'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user?.rollOrEmployeeId || role}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <p className="text-[10px] font-semibold text-blue-600 uppercase mt-0.5">
                  {role?.replace('_', ' ')}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left cursor-pointer"
                >
                  <User size={14} className="text-slate-400" />
                  My Profile
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} className="text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
