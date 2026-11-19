import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../redux/slices/authSlice.js';
import FormInput from '../components/FormInput.jsx';
import logo from '../assets/logo.png'
import bgImage from '../assets/nitp_image.jpg'
import {
  Lock,
  Mail,
  ShieldCheck,
  GraduationCap,
  Wrench,
  Award,
  Crown,
  ArrowRight,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'student', label: 'Student', email: 'student@college.edu', icon: GraduationCap },
  { role: 'resolver', label: 'Resolver', email: 'resolver@college.edu', icon: Wrench },
  { role: 'hod', label: 'HOD', email: 'hod@college.edu', icon: Award },
  { role: 'admin', label: 'Admin', email: 'admin@college.edu', icon: ShieldCheck },
  { role: 'higher_authority', label: 'Higher Authority', email: 'principal@college.edu', icon: Crown },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, role, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'student') navigate('/student-dashboard');
      else if (role === 'resolver') navigate('/resolver-dashboard');
      else if (role === 'hod') navigate('/hod-dashboard');
      else if (role === 'higher_authority') navigate('/higher-authority-dashboard');
      else navigate('/admin-dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

  {/* Blurred Background Image Only */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
    style={{
      backgroundImage: `url(${bgImage})`,
      filter: "blur(5px)",
    }}
  />

  {/* Login Card */}
  <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-800">

    {/* Header branding */}
    <div className="text-center mb-8">
      <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-200 overflow-hidden p-2">
        <img
          src={logo}
          alt="NIT Patna Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        NIT Patna Grievance Portal
      </h1>

      <p className="text-sm text-slate-500 mt-2">
        College Grievance Redressal & Resolution System
      </p>
    </div>

    {/* Demo Accounts Quick-Select Buttons */}
    <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
        One-Click Demo Accounts (Stage Evaluation)
      </p>

      <div className="grid grid-cols-5 gap-1">
        {DEMO_ACCOUNTS.map((demo) => {
          const Icon = demo.icon;
          const isSelected = email === demo.email;

          return (
            <button
              key={demo.role}
              type="button"
              onClick={() => handleSelectDemo(demo.email)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={`Sign in as ${demo.label}`}
            >
              <Icon size={14} className="mb-1" />
              <span className="truncate w-full text-center">
                {demo.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Error message */}
    {error && (
      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
        {typeof error === 'string'
          ? error
          : 'Failed to sign in. Please verify credentials.'}
      </div>
    )}

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">

      <FormInput
        label="Institutional Email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="rollno@college.edu"
        required
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••••••"
        required
      />

      <div className="flex items-center justify-between text-xs text-slate-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Remember session
        </label>

        <a
          href="#forgot"
          onClick={(e) => {
            e.preventDefault();
            alert('Self-service password reset available via College IT Desk.');
          }}
          className="text-blue-600 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
        <ArrowRight size={16} />
      </button>
    </form>

    <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
      First time student or complainant?{' '}
      <Link
        to="/register"
        className="font-semibold text-blue-600 hover:underline"
      >
        Register new account
      </Link>
    </div>

  </div>
</div>
  );
};

export default Login;
