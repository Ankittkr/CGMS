import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../redux/slices/notificationSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notification
  );

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'resolution') return n.type === 'resolution';
    if (activeTab === 'escalation') return n.type === 'escalation';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle2 size={20} className="text-emerald-600" />;
      case 'escalation':
      case 'alert':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'assignment':
        return <Bell size={20} className="text-blue-600" />;
      default:
        return <Info size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Notification & Activity Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status updates, resolver assignments, and institutional escalations.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => dispatch(markAllNotificationsAsRead())}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            <CheckCheck size={14} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `All Notifications (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'resolution', label: 'Resolutions' },
          { id: 'escalation', label: 'Escalations' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading && notifications.length === 0 ? (
        <LoadingSpinner message="Fetching notifications..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No notifications found in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && dispatch(markNotificationAsRead(item._id))}
                className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                  item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`text-xs ${
                        item.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
