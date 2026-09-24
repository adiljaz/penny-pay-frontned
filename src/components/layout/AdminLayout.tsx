import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileMenuButton } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useLocation } from 'react-router-dom';

function getPageInfo(pathname: string): { title: string; breadcrumb: { label: string; path?: string }[] } {
  // Buy order detail
  const buyOrderMatch = pathname.match(/^\/admin\/orders\/buy\/(.+)$/);
  if (buyOrderMatch) {
    return {
      title: `Buy Order / ${buyOrderMatch[1]}`,
      breadcrumb: [
        { label: 'Orders', path: '/admin/orders/buy' },
        { label: 'Buy Orders', path: '/admin/orders/buy' },
        { label: buyOrderMatch[1] },
      ],
    };
  }

  // Sell order detail
  const sellOrderMatch = pathname.match(/^\/admin\/orders\/sell\/(.+)$/);
  if (sellOrderMatch) {
    return {
      title: `Sell Order / ${sellOrderMatch[1]}`,
      breadcrumb: [
        { label: 'Orders' },
        { label: 'Sell Orders', path: '/admin/orders/sell' },
        { label: sellOrderMatch[1] },
      ],
    };
  }

  // Customer detail
  const customerMatch = pathname.match(/^\/admin\/customers\/(.+)$/);
  if (customerMatch) {
    return {
      title: 'Customer Profile',
      breadcrumb: [
        { label: 'Customers', path: '/admin/customers' },
        { label: customerMatch[1] },
      ],
    };
  }

  // KYC detail
  const kycMatch = pathname.match(/^\/admin\/kyc\/(.+)$/);
  if (kycMatch) {
    return {
      title: 'KYC Review',
      breadcrumb: [
        { label: 'KYC', path: '/admin/kyc' },
        { label: kycMatch[1] },
      ],
    };
  }

  const map: Record<string, { title: string; breadcrumb: { label: string; path?: string }[] }> = {
    '/admin/dashboard': { title: 'Dashboard', breadcrumb: [{ label: 'Dashboard' }] },
    '/admin/orders/buy': { title: 'Buy Orders', breadcrumb: [{ label: 'Orders' }, { label: 'Buy Orders' }] },
    '/admin/orders/sell': { title: 'Sell Orders', breadcrumb: [{ label: 'Orders' }, { label: 'Sell Orders' }] },
    '/admin/customers': { title: 'Customers', breadcrumb: [{ label: 'Customers' }] },
    '/admin/kyc': { title: 'KYC Management', breadcrumb: [{ label: 'KYC' }] },
    '/admin/pricing': { title: 'Pricing', breadcrumb: [{ label: 'Pricing' }] },
    '/admin/notifications': { title: 'Notifications', breadcrumb: [{ label: 'Notifications' }] },
    '/admin/activity': { title: 'Activity Log', breadcrumb: [{ label: 'Activity Log' }] },
    '/admin/settings': { title: 'Settings', breadcrumb: [{ label: 'Settings' }] },
  };

  return map[pathname] || { title: 'PENNY PAY Admin', breadcrumb: [] };
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { title, breadcrumb } = getPageInfo(location.pathname);

  return (
    <div className="min-h-screen bg-pp-bg-soft">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          onMobileMenuClick={() => setMobileOpen(true)}
          MobileMenuButton={MobileMenuButton}
        />
        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
