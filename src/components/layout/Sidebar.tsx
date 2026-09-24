import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ShieldCheck,
  Tag,
  Bell,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { path: '/admin/orders/buy', label: 'Buy Orders', icon: ArrowDownCircle },
      { path: '/admin/orders/sell', label: 'Sell Orders', icon: ArrowUpCircle },
    ],
  },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
  { path: '/admin/pricing', label: 'Pricing', icon: Tag },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/activity', label: 'Activity Log', icon: Activity },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [ordersExpanded, setOrdersExpanded] = useState(
    location.pathname.startsWith('/admin/orders')
  );

  const handleLogout = () => {
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-pp-border w-64">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-pp-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-pp-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PP</span>
          </div>
          <div>
            <p className="text-sm font-bold text-pp-text leading-tight">PENNY PAY</p>
            <p className="text-xs text-pp-text-muted leading-tight">Admin Portal</p>
          </div>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden text-pp-text-muted hover:text-pp-text"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pp-scroll px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => setOrdersExpanded(!ordersExpanded)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      ordersExpanded
                        ? 'text-pp-accent bg-pp-accent-soft'
                        : 'text-pp-text-secondary hover:bg-pp-bg-soft hover:text-pp-text'
                    }`}
                  >
                    {item.icon && <item.icon className="w-[18px] h-[18px] flex-shrink-0" />}
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${ordersExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {ordersExpanded && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-pp-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            onClick={onMobileClose}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                  ? 'text-pp-accent bg-pp-accent-soft'
                                  : 'text-pp-text-secondary hover:bg-pp-bg-soft hover:text-pp-text'
                              }`
                            }
                          >
                            {child.icon && <child.icon className="w-[16px] h-[16px] flex-shrink-0" />}
                            <span>{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path!}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-pp-accent bg-pp-accent-soft'
                        : 'text-pp-text-secondary hover:bg-pp-bg-soft hover:text-pp-text'
                    }`
                  }
                >
                  {item.icon && <item.icon className="w-[18px] h-[18px] flex-shrink-0" />}
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-pp-accent text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="border-t border-pp-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-pp-accent-soft flex items-center justify-center text-xs font-semibold text-pp-accent">
            {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-pp-text truncate">{user?.username || 'admin_01'}</p>
            <p className="text-xs text-pp-text-muted truncate">{user?.role.replace('_', ' ') || 'SUPER ADMIN'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-pp-text-secondary hover:bg-pp-error-soft hover:text-pp-error transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-pp-text-secondary hover:bg-pp-bg-soft rounded-lg transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
