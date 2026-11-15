import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../redux/slices/notificationSlice.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import NotificationPanel from '../components/NotificationPanel.jsx';

const MainLayout = () => {
  const dispatch = useDispatch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    // Auto-refresh notifications every 45s
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 45000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Fixed Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Wrapper with Dynamic Left Margin */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-18' : 'lg:ml-64'
        }`}
      >
        <Navbar
          onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
