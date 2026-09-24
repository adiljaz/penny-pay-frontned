import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, Mail, Phone, Calendar, User } from 'lucide-react';
import { Card, SectionTitle, DetailRow, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, KycStatusBadge } from '@/components/shared/StatusBadge';
import { customersService, ordersService } from '@/services';
import type { Customer, Order } from '@/types';
import { formatINR, formatUSDT, formatDate, formatDateTime } from '@/utils/format';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      customersService.getCustomerById(id),
      customersService.getCustomerOrders(id),
    ]).then(([c, o]) => {
      setCustomer(c);
      setOrders(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <EmptyState
            icon={<XCircle className="w-10 h-10" />}
            title="Customer not found."
            action={<Button variant="primary" onClick={() => navigate('/admin/customers')}>Back to Customers</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-pp-text-secondary hover:text-pp-text transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-pp-accent-soft flex items-center justify-center text-lg font-semibold text-pp-accent">
          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-pp-text">{customer.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-pp-text-secondary">{customer.mobile}</span>
            <KycStatusBadge status={customer.kycStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Account Info */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Account Information</SectionTitle>
            </div>
            <DetailRow label="KYC Status">
              <KycStatusBadge status={customer.kycStatus} />
            </DetailRow>
            {customer.kycReference && (
              <DetailRow label="KYC Reference">
                <span className="font-mono text-sm">{customer.kycReference}</span>
              </DetailRow>
            )}
            <DetailRow label="Registered">
              {formatDate(customer.registeredAt)}
            </DetailRow>
            <DetailRow label="Total Orders" mono>
              {customer.totalOrders}
            </DetailRow>
            <DetailRow label="Total Volume" mono>
              {formatINR(customer.totalVolume)}
            </DetailRow>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Contact</SectionTitle>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pp-text-muted" />
                <span className="text-sm text-pp-text">{customer.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pp-text-muted" />
                <span className="text-sm text-pp-text">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pp-text-muted" />
                <span className="text-sm text-pp-text-secondary">{formatDateTime(customer.registeredAt)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-5 py-4 border-b border-pp-border">
              <h2 className="text-base font-semibold text-pp-text">Order History</h2>
            </div>
            {orders.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="w-10 h-10" />}
                title="No orders yet."
                message="This customer has not placed any orders."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pp-border bg-pp-bg-soft">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Order</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Type</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-pp-text-secondary">INR</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-pp-text-secondary">USDT</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-pp-text-secondary">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-pp-text-secondary hidden md:table-cell">Date</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pp-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-pp-bg-soft transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-pp-text tabular-nums">{order.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-pp-accent-soft text-pp-accent">
                            {order.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-pp-text tabular-nums text-right">{formatINR(order.inrAmount)}</td>
                        <td className="px-4 py-3 text-sm text-pp-text-secondary tabular-nums text-right">{formatUSDT(order.usdtAmount)}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} short /></td>
                        <td className="px-4 py-3 text-sm text-pp-text-secondary hidden md:table-cell">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/admin/orders/buy/${order.id}`} className="text-sm font-medium text-pp-accent hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
