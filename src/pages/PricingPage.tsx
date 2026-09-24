import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Tag, Clock, Edit } from 'lucide-react';
import { Card, SectionTitle, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { pricingService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Pricing as PricingType } from '@/types';
import { formatINR, formatPricePerUSDT, formatDateTime } from '@/utils/format';

export function PricingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pricing, setPricing] = useState<PricingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [priceError, setPriceError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const adminName = user?.username || 'admin_01';

  useEffect(() => {
    pricingService.getPricing().then((p) => {
      setPricing(p);
      setLoading(false);
    });
  }, []);

  const handleUpdatePrice = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      setPriceError('Please enter a valid price.');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await pricingService.updateBuyPrice(price, priceReason, adminName);
      setPricing(updated);
      setUpdateModal(false);
      setNewPrice('');
      setPriceReason('');
      setPriceError('');
      showToast('success', `Buy price updated. New orders will use ${formatPricePerUSDT(price)}.`);
    } catch {
      showToast('error', 'Price update failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Buy Price Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-pp-accent-soft flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-pp-accent" />
            </div>
            <div>
              <p className="text-xs text-pp-text-secondary font-medium uppercase tracking-wide">Buy Price</p>
              <p className="text-3xl font-bold text-pp-text tabular-nums mt-1">{formatPricePerUSDT(pricing.currentBuyPrice)}</p>
            </div>
          </div>
          <Button variant="outline" size="md" icon={<Edit className="w-4 h-4" />} onClick={() => setUpdateModal(true)}>
            Change Buy Price
          </Button>
        </div>
      </Card>

      {/* Sell Price Card */}
      <Card className={pricing.sellActive ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-neutral-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-pp-text-secondary font-medium uppercase tracking-wide">Sell Price</p>
                {!pricing.sellActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">Coming Soon</span>
                )}
              </div>
              <p className="text-3xl font-bold text-pp-text tabular-nums mt-1">{formatPricePerUSDT(pricing.currentSellPrice)}</p>
            </div>
          </div>
          <Button variant="ghost" size="md" disabled>
            Change Sell Price
          </Button>
        </div>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-pp-info-soft border border-pp-info-border rounded-lg">
        <Tag className="w-5 h-5 text-pp-info flex-shrink-0 mt-0.5" />
        <p className="text-sm text-pp-text-secondary">
          Price changes apply to newly created orders only. Existing orders retain their original locked price.
        </p>
      </div>

      {/* Price History */}
      <Card noPadding>
        <div className="px-5 py-4 border-b border-pp-border">
          <h2 className="text-base font-semibold text-pp-text">Price History</h2>
        </div>
        {pricing.history.length === 0 ? (
          <EmptyState icon={<Clock className="w-10 h-10" />} title="No price changes recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pp-border bg-pp-bg-soft">
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Admin</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary">Old Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-pp-text-secondary">New Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {pricing.history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-pp-bg-soft transition-colors">
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">{formatDateTime(entry.date)}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">{entry.admin}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary tabular-nums text-right">{formatINR(entry.oldPrice)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-pp-text tabular-nums text-right">{formatINR(entry.newPrice)}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Update Price Modal */}
      <Modal
        open={updateModal}
        onClose={() => { setUpdateModal(false); setPriceError(''); }}
        title="Update Buy Price"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => { setUpdateModal(false); setPriceError(''); }} disabled={actionLoading}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleUpdatePrice} loading={actionLoading}>Update Price</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
            <p className="text-xs text-pp-text-muted">Current Buy Price</p>
            <p className="text-lg font-semibold text-pp-text tabular-nums">{formatINR(pricing.currentBuyPrice)}</p>
          </div>
          <Input
            label="New Buy Price"
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => { setNewPrice(e.target.value); setPriceError(''); }}
            placeholder="103.00"
            prefix="₹"
            error={priceError}
          />
          <Input
            label="Reason (optional)"
            type="text"
            value={priceReason}
            onChange={(e) => setPriceReason(e.target.value)}
            placeholder="Market adjustment"
          />
          <div className="flex items-start gap-2 p-3 bg-pp-warning-soft border border-pp-warning-border rounded-lg">
            <Clock className="w-4 h-4 text-pp-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-pp-text-secondary">
              This price will be used for newly created orders. Existing orders retain their original locked price.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
