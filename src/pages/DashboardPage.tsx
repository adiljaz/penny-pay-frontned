import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  FileText,
  Send,
  AlertCircle,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Card, SectionTitle, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { dashboardService } from '@/services';
import type { Order, KycRecord, ActivityLogEntry } from '@/types';
import { formatINR, formatUSDT, formatTime, formatDate, timeAgo } from '@/utils/format';
import { statusMeta } from '@/utils/status';

interface Metrics {
  pendingVerification: number;
  processing: number;
  pendingKyc: number;
  completedToday: number;
}

interface NeedsAttention {
  orders: Order[];
  kyc: KycRecord[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttention | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getNeedsAttention(),
      dashboardService.getRecentActivity(),
    ]).then(([m, na, ra]) => {
      setMetrics(m);
      setNeedsAttention(na);
      setRecentActivity(ra);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Pending Payment Verification',
      value: metrics?.pendingVerification || 0,
      icon: Clock,
      color: 'text-pp-warning',
      bg: 'bg-pp-warning-soft',
      border: 'border-pp-warning-border',
      onClick: () => navigate('/admin/orders/buy?status=PAYMENT_VERIFICATION'),
    },
    {
      label: 'Processing',
      value: metrics?.processing || 0,
      icon: Loader2,
      color: 'text-pp-accent',
      bg: 'bg-pp-accent-soft',
      border: 'border-pp-accent-border',
      onClick: () => navigate('/admin/orders/buy?status=PROCESSING'),
    },
    {
      label: 'Pending KYC',
      value: metrics?.pendingKyc || 0,
      icon: ShieldCheck,
      color: 'text-pp-info',
      bg: 'bg-pp-info-soft',
      border: 'border-pp-info-border',
      onClick: () => navigate('/admin/kyc?status=PENDING'),
    },
    {
      label: 'Completed Today',
      value: metrics?.completedToday || 0,
      icon: CheckCircle,
      color: 'text-pp-success',
      bg: 'bg-pp-success-soft',
      border: 'border-pp-success-border',
      onClick: () => navigate('/admin/orders/buy?status=COMPLETED'),
    },
  ];

  const allAttentionItems = [
    ...(needsAttention?.orders || []).map((o) => ({
      type: 'order' as const,
      id: o.id,
      customerName: o.customer.name,
      status: o.status,
      amount: o.inrAmount,
      usdt: o.usdtAmount,
      route: `/admin/orders/buy/${o.id}`,
    })),
    ...(needsAttention?.kyc || []).map((k) => ({
      type: 'kyc' as const,
      id: k.providerReference,
      customerName: k.customerName,
      status: 'PENDING' as const,
      kycId: k.id,
      route: `/admin/kyc/${k.id}`,
    })),
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {metricCards.map((m) => (
          <button
            key={m.label}
            onClick={m.onClick}
            className={`flex flex-col p-4 bg-white border ${m.border} rounded-xl text-left hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-pp-text tabular-nums">{m.value}</p>
            <p className="text-xs lg:text-sm text-pp-text-secondary mt-1 leading-tight">{m.label}</p>
          </button>
        ))}
      </div>

      {/* Needs Attention + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-5 py-4 border-b border-pp-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-pp-warning" />
                <h2 className="text-base font-semibold text-pp-text">Needs Attention</h2>
              </div>
              {allAttentionItems.length > 0 && (
                <span className="text-xs font-medium text-pp-text-secondary bg-pp-bg-soft px-2 py-1 rounded-full">
                  {allAttentionItems.length} items
                </span>
              )}
            </div>

            {allAttentionItems.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="w-10 h-10" />}
                title="No orders need your attention."
                message="All pending items have been processed."
              />
            ) : (
              <div className="divide-y divide-pp-border">
                {allAttentionItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => navigate(item.route)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-pp-bg-soft transition-colors text-left"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {item.type === 'order' && item.status === 'PAYMENT_VERIFICATION' && (
                        <div className="w-10 h-10 rounded-lg bg-pp-warning-soft flex items-center justify-center">
                          <FileText className="w-5 h-5 text-pp-warning" />
                        </div>
                      )}
                      {item.type === 'order' && (item.status === 'PROCESSING' || item.status === 'USDT_SENT') && (
                        <div className="w-10 h-10 rounded-lg bg-pp-accent-soft flex items-center justify-center">
                          <Send className="w-5 h-5 text-pp-accent" />
                        </div>
                      )}
                      {item.type === 'kyc' && (
                        <div className="w-10 h-10 rounded-lg bg-pp-info-soft flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-pp-info" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {item.type === 'order' && item.status === 'PAYMENT_VERIFICATION' && (
                        <>
                          <p className="text-sm font-medium text-pp-text">
                            Payment receipt uploaded
                          </p>
                          <p className="text-xs text-pp-text-secondary mt-0.5">
                            {item.id} · {item.customerName} · {formatINR(item.amount)} · {formatUSDT(item.usdt)}
                          </p>
                          <p className="text-xs text-pp-warning font-medium mt-1">Payment Verification</p>
                        </>
                      )}
                      {item.type === 'order' && item.status === 'PROCESSING' && (
                        <>
                          <p className="text-sm font-medium text-pp-text">USDT transfer pending</p>
                          <p className="text-xs text-pp-text-secondary mt-0.5">
                            {item.id} · {formatUSDT(item.usdt)}
                          </p>
                          <p className="text-xs text-pp-accent font-medium mt-1">Processing</p>
                        </>
                      )}
                      {item.type === 'order' && item.status === 'USDT_SENT' && (
                        <>
                          <p className="text-sm font-medium text-pp-text">Order ready to complete</p>
                          <p className="text-xs text-pp-text-secondary mt-0.5">
                            {item.id} · {formatUSDT(item.usdt)} · TXID recorded
                          </p>
                          <p className="text-xs text-pp-info font-medium mt-1">USDT Sent</p>
                        </>
                      )}
                      {item.type === 'kyc' && (
                        <>
                          <p className="text-sm font-medium text-pp-text">KYC submitted</p>
                          <p className="text-xs text-pp-text-secondary mt-0.5">
                            {item.customerName} · {item.id}
                          </p>
                          <p className="text-xs text-pp-warning font-medium mt-1">Pending verification</p>
                        </>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {item.type === 'order' && item.status === 'PAYMENT_VERIFICATION' && (
                        <Button variant="outline" size="sm">Review Payment</Button>
                      )}
                      {item.type === 'order' && item.status === 'PROCESSING' && (
                        <Button variant="outline" size="sm">Open Order</Button>
                      )}
                      {item.type === 'order' && item.status === 'USDT_SENT' && (
                        <Button variant="outline" size="sm">Open Order</Button>
                      )}
                      {item.type === 'kyc' && (
                        <Button variant="outline" size="sm">Review KYC</Button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card noPadding>
            <div className="px-5 py-4 border-b border-pp-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-pp-text-secondary" />
                <h2 className="text-base font-semibold text-pp-text">Recent Activity</h2>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <EmptyState
                icon={<ActivityIcon className="w-10 h-10" />}
                title="No activity recorded yet."
              />
            ) : (
              <div className="divide-y divide-pp-border max-h-[500px] overflow-y-auto pp-scroll">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-5 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-pp-text">{activity.action}</p>
                        <p className="text-xs text-pp-text-secondary mt-0.5">{activity.entityId}</p>
                        <p className="text-xs text-pp-text-muted mt-1">
                          {formatTime(activity.timestamp)} · {activity.admin}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-3 border-t border-pp-border">
              <Link
                to="/admin/activity"
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-pp-accent hover:gap-2.5 transition-all"
              >
                View Activity Log
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Completed Orders */}
      <div>
        <Card noPadding>
          <div className="px-5 py-4 border-b border-pp-border">
            <h2 className="text-base font-semibold text-pp-text">Recent Completed Orders</h2>
          </div>
          <CompletedOrdersTable />
        </Card>
      </div>
    </div>
  );
}

function CompletedOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getNeedsAttention().then(() => {
      // Also get completed orders
      import('@/services').then(({ ordersService }) => {
        ordersService.getOrders({ status: 'COMPLETED' }).then((all) => {
          setOrders(all.slice(0, 5));
          setLoading(false);
        });
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="p-5">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 mb-2" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle className="w-10 h-10" />}
        title="No completed orders today."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-pp-border bg-pp-bg-soft">
            <th className="px-5 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Order ID</th>
            <th className="px-5 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Customer</th>
            <th className="px-5 py-2.5 text-right text-xs font-medium text-pp-text-secondary">INR</th>
            <th className="px-5 py-2.5 text-right text-xs font-medium text-pp-text-secondary">USDT</th>
            <th className="px-5 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Status</th>
            <th className="px-5 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Date</th>
            <th className="px-5 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pp-border">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-pp-bg-soft transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-pp-text tabular-nums">{order.id}</td>
              <td className="px-5 py-3 text-sm text-pp-text-secondary">{order.customer.name}</td>
              <td className="px-5 py-3 text-sm font-medium text-pp-text tabular-nums text-right">{formatINR(order.inrAmount)}</td>
              <td className="px-5 py-3 text-sm text-pp-text-secondary tabular-nums text-right">{formatUSDT(order.usdtAmount)}</td>
              <td className="px-5 py-3"><StatusBadge status={order.status} short /></td>
              <td className="px-5 py-3 text-sm text-pp-text-secondary">{formatDate(order.createdAt)}</td>
              <td className="px-5 py-3 text-right">
                <Link to={`/admin/orders/buy/${order.id}`} className="text-sm font-medium text-pp-accent hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
