import { ArrowUpCircle, Clock } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui/Card';

export function SellOrdersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <EmptyState
          icon={<ArrowUpCircle className="w-12 h-12" />}
          title="Sell Orders — Coming Soon"
          message="The Sell USDT feature is part of the PENNY PAY roadmap. The architecture supports sell orders, but this functionality is not yet available in V1."
          action={
            <div className="flex items-center gap-2 text-sm text-pp-text-muted">
              <Clock className="w-4 h-4" />
              <span>Future statuses: Order Created, USDT Pending, USDT Verification, USDT Received, Processing, INR Payout, Completed</span>
            </div>
          }
        />
      </Card>
    </div>
  );
}
