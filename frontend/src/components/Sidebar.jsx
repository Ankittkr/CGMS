import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  FilePlus2,
  ListTodo,
  ShieldAlert,
  Users,
  Building2,
  FolderTree,
  CheckSquare,
  Bell,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Crown,
  GraduationCap,
  Wrench,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { role, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  // Grouped Navigation definition based on application roles
  const getNavSections = () => {
    switch (role) {
      case 'student':
        return [
          {
            section: 'STUDENT PORTAL',
            items: [
              { name: 'Dashboard', to: '/student-dashboard', icon: LayoutDashboard },
              { name: 'Lodge Grievance', to: '/submit-grievance', icon: FilePlus2 },
              { name: 'My Grievances', to: '/my-grievances', icon: ListTodo },
            ],
          },
          {
            section: 'ACCOUNT',
            items: [
              { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', to: '/profile', icon: Sliders },
            ],
          },
        ];

      case 'resolver':
        return [
          {
            section: 'RESOLVER CELL',
            items: [
              { name: 'Resolver Workspace', to: '/resolver-dashboard', icon: LayoutDashboard },
              { name: 'Assigned Complaints', to: '/manage-grievances', icon: CheckSquare },
            ],
          },
          {
            section: 'ACCOUNT',
            items: [
              { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', to: '/profile', icon: Sliders },
            ],
          },
        ];

      case 'hod':
        return [
          {
            section: 'DEPARTMENT LEAD',
            items: [
              { name: 'HOD Console', to: '/hod-dashboard', icon: LayoutDashboard },
              { name: 'Dept Complaints', to: '/manage-grievances', icon: ShieldAlert },
              { name: 'Categories & SLAs', to: '/categories', icon: FolderTree },
              { name: 'SLA Analytics', to: '/reports', icon: BarChart3 },
            ],
          },
          {
            section: 'COMMUNICATION',
            items: [
              { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', to: '/profile', icon: Sliders },
            ],
          },
        ];

      case 'higher_authority':
        return [
          {
            section: 'EXECUTIVE CELL',
            items: [
              { name: 'Executive Oversight', to: '/higher-authority-dashboard', icon: LayoutDashboard },
              { name: 'Escalated Cases', to: '/manage-grievances', icon: ShieldAlert },
              { name: 'Institutional Analytics', to: '/reports', icon: BarChart3 },
            ],
          },
          {
            section: 'COMMUNICATION',
            items: [
              { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', to: '/profile', icon: Sliders },
            ],
          },
        ];

      case 'admin':
      default:
        return [
          {
            section: 'ADMINISTRATION',
            items: [
              { name: 'Admin Console', to: '/admin-dashboard', icon: LayoutDashboard },
              { name: 'Manage Complaints', to: '/manage-grievances', icon: ShieldAlert },
              { name: 'User Directory', to: '/manage-users', icon: Users },
              { name: 'Departments', to: '/departments', icon: Building2 },
              { name: 'Categories & SLAs', to: '/categories', icon: FolderTree },
            ],
          },
          {
            section: 'INSIGHTS & SYSTEM',
            items: [
              { name: 'SLA & Audit Reports', to: '/reports', icon: BarChart3 },
              { name: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', to: '/profile', icon: Sliders },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Element */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
              C
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-tight truncate">
                  CGMS Portal
                </h1>
                <p className="text-[10px] text-slate-400 truncate">
                  Institutional Grievance
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* User Info Strip (Expanded) */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {user?.name || 'Authorized Member'}
              </p>
              <p className="text-[10px] text-blue-400 font-medium capitalize">
                {role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          {navSections.map((group) => (
            <div key={group.section}>
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-1.5">
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isCollapsed ? 'justify-center' : 'justify-between'
                        } ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                        }`
                      }
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={17} className="shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Expand toggle at bottom when collapsed */}
        {isCollapsed && (
          <div className="p-3 border-t border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
