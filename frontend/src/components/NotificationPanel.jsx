import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../redux/slices/notificationSlice.js';
import { X, CheckCheck, Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notification);

  const getIcon = (type) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case 'escalation':
      case 'alert':
        return <AlertCircle size={18} className="text-red-600" />;
      case 'assignment':
        return <Bell size={18} className="text-blue-600" />;
      default:
        return <Info size={18} className="text-slate-500" />;
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 w-96 max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsAsRead())}
                className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={13} /> Read all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-400">
              No notifications yet.
            </li>
          ) : (
            notifications.map((item) => (
              <li
                key={item._id}
                onClick={() => !item.isRead && dispatch(markNotificationAsRead(item._id))}
                className={`p-4 flex gap-3 cursor-pointer transition-colors ${
                  item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-xs truncate ${
                        item.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </aside>
    </>
  );
};

export default NotificationPanel;
