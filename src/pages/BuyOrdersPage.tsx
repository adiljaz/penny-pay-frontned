import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Inbox, Eye } from 'lucide-react';
import { Card, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ordersService } from '@/services';
import type { Order, BuyOrderStatus } from '@/types';
import { formatINR, formatUSDT, formatPricePerUSDT, formatDate } from '@/utils/format';
import { statusMeta } from '@/utils/status';

const statusFilters: { label: string; value: BuyOrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Payment Verification', value: 'PAYMENT_VERIFICATION' },
  { label: 'Payment Confirmed', value: 'PAYMENT_CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'USDT Sent', value: 'USDT_SENT' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function BuyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState<BuyOrderStatus | 'ALL'>(
    (searchParams.get('status') as BuyOrderStatus) || 'ALL'
  );

  useEffect(() => {
    setLoading(true);
    ordersService
      .getOrders({
        status: activeFilter === 'ALL' ? undefined : activeFilter,
        search: search || undefined,
      })
      .then((result) => {
        setOrders(result);
        setLoading(false);
      });
  }, [activeFilter, search]);

  const handleFilterChange = (filter: BuyOrderStatus | 'ALL') => {
    setActiveFilter(filter);
    const params: Record<string, string> = {};
    if (filter !== 'ALL') params.status = filter;
    if (search) params.search = search;
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (activeFilter !== 'ALL') params.status = activeFilter;
    if (search) params.search = search;
    setSearchParams(params);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Order ID / Customer / Mobile"
          prefix={<Search className="w-4 h-4" />}
        />
      </form>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pp-scroll pb-1">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
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
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10" />}
            title="No orders found."
            message={activeFilter === 'ALL' ? 'There are no buy orders to display.' : `No orders with status "${statusMeta[activeFilter as BuyOrderStatus]?.label}".`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pp-border bg-pp-bg-soft">
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary">INR Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary">USDT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary hidden md:table-cell">Buy Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-pp-bg-soft transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-pp-text tabular-nums">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">{order.customer.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-pp-text tabular-nums text-right">{formatINR(order.inrAmount)}</td>
                    <td className="px-4 py-3 text-sm text-pp-text tabular-nums text-right">{formatUSDT(order.usdtAmount)}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary tabular-nums text-right hidden md:table-cell">{formatPricePerUSDT(order.price.buyPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} short /></td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary hidden lg:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/orders/buy/${order.id}`}>
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

      {/* Result count */}
      {!loading && orders.length > 0 && (
        <p className="text-xs text-pp-text-muted text-center">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
