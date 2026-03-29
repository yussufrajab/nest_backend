'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/use-notifications';
import { NotificationItem } from './NotificationItem';
import {
  Bell,
  CheckCheck,
  Loader2,
  Inbox,
  ChevronRight,
} from 'lucide-react';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(isOpen); // Only poll when dropdown is open

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-xl transition-all duration-200
          ${isOpen
            ? 'bg-primary-100 text-primary-600'
            : 'text-slate-500 hover:text-primary-600 hover:bg-primary-50'
          }
        `}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1.5 text-[10px] font-semibold text-white bg-rose-500 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'No new notifications'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                <p className="text-sm text-slate-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-slate-50 mb-3">
                  <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 mb-1">No notifications yet</p>
                <p className="text-xs text-slate-400">
                  You&apos;ll see updates here when they arrive
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        New
                      </span>
                    </div>
                    <div className="px-2 space-y-1">
                      {unreadNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Read Notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    {unreadNotifications.length > 0 && (
                      <div className="px-4 py-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Earlier
                        </span>
                      </div>
                    )}
                    <div className="px-2 space-y-1">
                      {readNotifications.slice(0, 10).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Close notifications
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
