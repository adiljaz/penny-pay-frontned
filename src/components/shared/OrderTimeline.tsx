import type { StatusHistoryEntry, BuyOrderStatus } from '@/types';
import { Check, X, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { statusMeta } from '@/utils/status';

interface OrderTimelineProps {
  history: StatusHistoryEntry[];
  currentStatus: BuyOrderStatus;
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-pp-text-secondary text-center py-8">
        No timeline events recorded.
      </p>
    );
  }

  return (
    <div className="relative">
      {history.map((entry, index) => {
        const isError = entry.status === 'REJECTED' || entry.status === 'CANCELLED';
        const isLast = index === history.length - 1;
        const meta = statusMeta[entry.status];

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-pp-border" aria-hidden="true" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isError
                  ? 'bg-pp-error-soft border-pp-error'
                  : 'bg-pp-success-soft border-pp-success'
              }`}
            >
              {isError ? (
                <X className="w-4 h-4 text-pp-error" />
              ) : (
                <Check className="w-4 h-4 text-pp-success" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-pp-text">
                  {meta.label}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isError ? 'bg-pp-error-soft text-pp-error' : 'bg-pp-success-soft text-pp-success'}`}
                >
                  {isError ? 'Failed' : 'Done'}
                </span>
              </div>
              <p className="text-xs text-pp-text-secondary mt-0.5">
                {formatDateTime(entry.timestamp)}
              </p>
              {entry.admin && (
                <p className="text-xs text-pp-text-muted mt-1">
                  Admin: <span className="font-medium text-pp-text-secondary">{entry.admin}</span>
                </p>
              )}
              {entry.note && (
                <p className="text-xs text-pp-text-secondary mt-1 bg-pp-bg-soft px-2.5 py-1.5 rounded-md border border-pp-border">
                  {entry.note}
                </p>
              )}
              {entry.rejectionReason && (
                <p className="text-xs text-pp-error mt-1 bg-pp-error-soft px-2.5 py-1.5 rounded-md border border-pp-error-border">
                  Reason: {entry.rejectionReason}
                </p>
              )}
              {entry.txid && (
                <p className="text-xs text-pp-text-secondary mt-1 bg-pp-info-soft px-2.5 py-1.5 rounded-md border border-pp-info-border font-mono break-all">
                  TXID: {entry.txid}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
