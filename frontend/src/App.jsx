import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice.js';

// Layout & Protected Route
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Role Dashboards
import StudentDashboard from './pages/StudentDashboard.jsx';
import ResolverDashboard from './pages/ResolverDashboard.jsx';
import HodDashboard from './pages/HodDashboard.jsx';
import HigherAuthorityDashboard from './pages/HigherAuthorityDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Feature Pages
import SubmitGrievance from './pages/SubmitGrievance.jsx';
import MyGrievances from './pages/MyGrievances.jsx';
import GrievanceDetails from './pages/GrievanceDetails.jsx';
import ManageGrievances from './pages/ManageGrievances.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import DepartmentsPage from './pages/DepartmentsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';

// Dynamic Dashboard Redirect based on Role
const DashboardRedirect = () => {
  const { role } = useSelector((state) => state.auth);
  switch (role) {
    case 'student':
      return <Navigate to="/student-dashboard" replace />;
    case 'resolver':
      return <Navigate to="/resolver-dashboard" replace />;
    case 'hod':
      return <Navigate to="/hod-dashboard" replace />;
    case 'higher_authority':
      return <Navigate to="/higher-authority-dashboard" replace />;
    case 'admin':
    default:
      return <Navigate to="/admin-dashboard" replace />;
  }
};

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration" element={<Navigate to="/register" replace />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Role Dashboards */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/resolver-dashboard" element={<ResolverDashboard />} />
            <Route path="/hod-dashboard" element={<HodDashboard />} />
            <Route path="/higher-authority-dashboard" element={<HigherAuthorityDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Grievance Management */}
            <Route path="/submit-grievance" element={<SubmitGrievance />} />
            <Route path="/my-grievances" element={<MyGrievances />} />
            <Route path="/grievance/:id" element={<GrievanceDetails />} />
            <Route path="/manage-grievances" element={<ManageGrievances />} />

            {/* Administration & Setup */}
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Insights & Communication */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
