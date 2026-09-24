import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Inbox, Eye } from 'lucide-react';
import { Card, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KycStatusBadge } from '@/components/shared/StatusBadge';
import { customersService } from '@/services';
import type { Customer, KycStatus } from '@/types';
import { formatDate } from '@/utils/format';

const kycFilters: { label: string; value: KycStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'KYC Verified', value: 'VERIFIED' },
  { label: 'KYC Pending', value: 'PENDING' },
  { label: 'KYC Rejected', value: 'REJECTED' },
];

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<KycStatus | 'ALL'>('ALL');

  useEffect(() => {
    setLoading(true);
    customersService
      .getCustomers({
        search: search || undefined,
        kycStatus: activeFilter === 'ALL' ? undefined : activeFilter,
      })
      .then((result) => {
        setCustomers(result);
        setLoading(false);
      });
  }, [search, activeFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Search */}
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customer / mobile"
        prefix={<Search className="w-4 h-4" />}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pp-scroll pb-1">
        {kycFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-all ${
              activeFilter === filter.value
                ? 'bg-pp-accent text-white border-pp-accent'
                : 'bg-white text-pp-text-secondary border-pp-border hover:bg-pp-bg-soft hover:text-pp-text'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 mb-2" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10" />}
            title="No customers found."
            message="No customers match your search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pp-border bg-pp-bg-soft">
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">KYC Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary hidden md:table-cell">Registration Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary hidden lg:table-cell">Orders</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-pp-bg-soft transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-pp-text">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">{customer.mobile}</td>
                    <td className="px-4 py-3"><KycStatusBadge status={customer.kycStatus} /></td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary hidden md:table-cell">{formatDate(customer.registeredAt)}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary tabular-nums text-right hidden lg:table-cell">{customer.totalOrders} orders</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && customers.length > 0 && (
        <p className="text-xs text-pp-text-muted text-center">
          Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
