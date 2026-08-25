import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  FolderKanban,
  Megaphone,
  CalendarCheck,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { EmptyState } from '../feedback/EmptyState';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'project' | 'announcement' | 'attendance';
  isRead: boolean;
  link?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Project Status Updated',
    message: 'Portal Authentication Redesign status was updated to In Progress by Dr. Robert Vance.',
    timestamp: '15m ago',
    category: 'project',
    isRead: false,
    link: '/admin/projects',
  },
  {
    id: 'notif-2',
    title: 'New Administrative Announcement',
    message: 'Mid-term internship evaluations will take place next week. Please complete your milestones.',
    timestamp: '1h ago',
    category: 'announcement',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Project Milestone Achieved',
    message: 'AI Code Review Assistant reached 60% progress milestone.',
    timestamp: '3h ago',
    category: 'project',
    isRead: false,
    link: '/admin/projects',
  },
  {
    id: 'notif-4',
    title: 'Townhall Meeting Scheduled',
    message: 'Engineering department townhall & Q&A session this Thursday at 3:00 PM.',
    timestamp: 'Yesterday',
    category: 'announcement',
    isRead: true,
  },
  {
    id: 'notif-5',
    title: 'Attendance Records Verified',
    message: 'Weekly attendance logs for all active interns have been approved.',
    timestamp: '2d ago',
    category: 'attendance',
    isRead: true,
  },
];

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'project' | 'announcement'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle outside clicks to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const handleItemClick = (notification: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    );

    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'project') return item.category === 'project';
    if (activeFilter === 'announcement') return item.category === 'announcement';
    return true;
  });

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'attendance':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEmptyStateContent = () => {
    if (activeFilter === 'unread') {
      return {
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
        title: "You're All Caught Up",
        description:
          "There are no unread notifications right now. New project status changes and announcements will appear here when posted.",
        action: notifications.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            View all ({notifications.length}) notifications
          </button>
        ) : undefined,
      };
    }

    if (activeFilter === 'project') {
      return {
        icon: <FolderKanban className="w-6 h-6 text-blue-600" />,
        title: 'No Project Updates',
        description:
          'There are no recent notifications about project status changes, deadline updates, or milestones.',
        action: (
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            Show all categories
          </button>
        ),
      };
    }

    if (activeFilter === 'announcement') {
      return {
        icon: <Megaphone className="w-6 h-6 text-amber-600" />,
        title: 'No Announcements',
        description:
          'No administrative alerts or department-wide announcements have been posted yet.',
        action: (
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            Show all categories
          </button>
        ),
      };
    }

    return {
      icon: <BellOff className="w-6 h-6 text-slate-400" />,
      title: 'No Notifications',
      description:
        'You have no notifications or announcements at this time. Check back later for updates regarding your projects and department notices.',
      action: undefined,
    };
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`relative min-h-[44px] min-w-[44px] p-2.5 rounded-md flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 outline-none ${
          isOpen
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl border border-slate-200 ring-1 ring-black/5 z-40 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  unreadCount > 0
                    ? 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer'
                    : 'text-slate-400 bg-slate-100/60 border border-transparent cursor-not-allowed opacity-60'
                }`}
                title="Mark all notifications as read"
                aria-label="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('project')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'project'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('announcement')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'announcement'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Announcements
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 relative ${
                    !item.isRead ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                >
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.category === 'project'
                        ? 'bg-blue-100 text-blue-700'
                        : item.category === 'announcement'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3
                        className={`text-xs font-semibold truncate ${
                          !item.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                      <span>{item.timestamp}</span>
                      {item.link && (
                        <span className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5">
                          View details
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Read Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(item.id, e)}
                    className="absolute top-3.5 right-3 text-slate-300 hover:text-slate-600 p-1 rounded transition-colors"
                    title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                    aria-label={item.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    <span
                      className={`block w-2.5 h-2.5 rounded-full border ${
                        !item.isRead
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-transparent border-slate-300 hover:border-slate-400'
                      }`}
                    />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-2">
                <EmptyState
                  icon={emptyState.icon}
                  title={emptyState.title}
                  description={emptyState.description}
                  action={emptyState.action}
                  className="border-0 shadow-none p-6 sm:p-8 bg-transparent"
                />
              </div>
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread of ${notifications.length} total`
                  : 'All notifications are read'}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
