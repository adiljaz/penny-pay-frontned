import type { BuyOrderStatus, KycStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { statusMeta } from '@/utils/status';

interface StatusBadgeProps {
  status: BuyOrderStatus;
  short?: boolean;
}

export function StatusBadge({ status, short = false }: StatusBadgeProps) {
  const meta = statusMeta[status];
  return (
    <Badge color={meta.color} dot>
      {short ? meta.shortLabel : meta.label}
    </Badge>
  );
}

interface KycStatusBadgeProps {
  status: KycStatus;
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  const config: Record<KycStatus, { label: string; color: 'neutral' | 'warning' | 'success' | 'error' }> = {
    NOT_STARTED: { label: 'Not Started', color: 'neutral' },
    PENDING: { label: 'Pending', color: 'warning' },
    VERIFIED: { label: 'Verified', color: 'success' },
    REJECTED: { label: 'Rejected', color: 'error' },
  };
  const { label, color } = config[status];
  return (
    <Badge color={color} dot>
      {label}
    </Badge>
  );
}
