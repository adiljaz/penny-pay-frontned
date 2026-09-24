import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { formatTime } from '@/utils/format';

interface TopBarProps {
  title: string;
  breadcrumb?: { label: string; path?: string }[];
  onMobileMenuClick: () => void;
  MobileMenuButton: React.ComponentType<{ onClick: () => void }>;
}

export function TopBar({ title, breadcrumb, onMobileMenuClick, MobileMenuButton }: TopBarProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-pp-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: mobile menu + title */}
        <div className="flex items-center gap-3 min-w-0">
          <MobileMenuButton onClick={onMobileMenuClick} />
          <div className="min-w-0">
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-pp-text-muted mb-0.5">
                {breadcrumb.map((bc, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    <span className={i === breadcrumb.length - 1 ? 'text-pp-text-secondary font-medium' : ''}>
                      {bc.label}
                    </span>
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-lg lg:text-xl font-semibold text-pp-text truncate">{title}</h1>
          </div>
        </div>

        {/* Right: search, notifications, profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search (hidden on small screens) */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pp-text-muted" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="w-56 lg:w-72 pl-9 pr-3 py-2 text-sm border border-pp-border rounded-lg bg-pp-bg-soft focus:bg-white focus:border-pp-accent focus:ring-1 focus:ring-pp-accent outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) navigate(`/admin/orders/buy?search=${encodeURIComponent(q)}`);
                }
              }}
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-pp-text-secondary hover:bg-pp-bg-soft rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pp-error text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-pp-border rounded-xl shadow-lg animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-pp-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-pp-text">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-pp-accent font-medium">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto pp-scroll">
                  {recentNotifications.length === 0 ? (
                    <p className="text-sm text-pp-text-secondary text-center py-8">No notifications</p>
                  ) : (
                    recentNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setNotifOpen(false);
                          navigate(n.entityRoute);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-pp-border last:border-0 hover:bg-pp-bg-soft transition-colors ${
                          !n.read ? 'bg-pp-accent-soft/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 bg-pp-accent rounded-full mt-1.5 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-pp-text uppercase tracking-wide">{n.title}</p>
                            <p className="text-sm text-pp-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-pp-text-muted mt-1">{formatTime(n.timestamp)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/admin/notifications');
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-pp-accent hover:bg-pp-accent-soft transition-colors text-center border-t border-pp-border"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-pp-bg-soft rounded-lg transition-colors"
              aria-label="Admin profile"
            >
              <div className="w-8 h-8 rounded-full bg-pp-accent-soft flex items-center justify-center text-xs font-semibold text-pp-accent">
                {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <ChevronDown className="w-4 h-4 text-pp-text-muted hidden lg:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-pp-border rounded-xl shadow-lg animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-pp-border">
                  <p className="text-sm font-medium text-pp-text">{user?.username || 'admin_01'}</p>
                  <p className="text-xs text-pp-text-muted">{user?.email || 'admin@pennypay.in'}</p>
                  <p className="text-xs text-pp-accent font-medium mt-1">{user?.role.replace('_', ' ') || 'SUPER ADMIN'}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full px-4 py-2.5 text-sm text-pp-text-secondary hover:bg-pp-bg-soft text-left transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-pp-error hover:bg-pp-error-soft text-left transition-colors border-t border-pp-border"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
