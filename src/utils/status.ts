import type { BuyOrderStatus } from '@/types';

// ==========================================
// Status metadata — badges, labels, colors
// Maps the conceptual backend status model
// to visual representation in the admin panel.
// ==========================================

export interface StatusMeta {
  label: string;
  shortLabel: string;
  color: 'neutral' | 'warning' | 'info' | 'success' | 'error' | 'accent';
  dotColor: string;
}

export const statusMeta: Record<BuyOrderStatus, StatusMeta> = {
  ORDER_CREATED: {
    label: 'Order Created',
    shortLabel: 'Created',
    color: 'neutral',
    dotColor: 'bg-neutral-400',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    shortLabel: 'Pending',
    color: 'neutral',
    dotColor: 'bg-neutral-400',
  },
  PAYMENT_VERIFICATION: {
    label: 'Payment Verification',
    shortLabel: 'Verification',
    color: 'warning',
    dotColor: 'bg-amber-500',
  },
  PAYMENT_CONFIRMED: {
    label: 'Payment Confirmed',
    shortLabel: 'Confirmed',
    color: 'info',
    dotColor: 'bg-blue-500',
  },
  PROCESSING: {
    label: 'Processing',
    shortLabel: 'Processing',
    color: 'accent',
    dotColor: 'bg-pp-accent',
  },
  USDT_SENT: {
    label: 'USDT Sent',
    shortLabel: 'USDT Sent',
    color: 'info',
    dotColor: 'bg-blue-500',
  },
  COMPLETED: {
    label: 'Completed',
    shortLabel: 'Completed',
    color: 'success',
    dotColor: 'bg-green-500',
  },
  REJECTED: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    color: 'error',
    dotColor: 'bg-red-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    color: 'neutral',
    dotColor: 'bg-neutral-400',
  },
};

// Status flow order for timeline display
export const statusFlow: BuyOrderStatus[] = [
  'ORDER_CREATED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFICATION',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'USDT_SENT',
  'COMPLETED',
];

// Available admin actions per status
export type AdminAction = 'VERIFY_PAYMENT' | 'CONFIRM_PAYMENT' | 'REJECT_PAYMENT' | 'START_PROCESSING' | 'ENTER_TXID' | 'MARK_USDT_SENT' | 'COMPLETE_ORDER' | 'NONE';

export function getAvailableActions(status: BuyOrderStatus): AdminAction[] {
  switch (status) {
    case 'PAYMENT_VERIFICATION':
      return ['CONFIRM_PAYMENT', 'REJECT_PAYMENT'];
    case 'PAYMENT_CONFIRMED':
      return ['START_PROCESSING'];
    case 'PROCESSING':
      return ['ENTER_TXID'];
    case 'USDT_SENT':
      return ['COMPLETE_ORDER'];
    case 'COMPLETED':
    case 'REJECTED':
    case 'CANCELLED':
    case 'ORDER_CREATED':
    case 'PAYMENT_PENDING':
      return [];
    default:
      return [];
  }
}

// Customer-facing status label (synced with customer app)
export function getCustomerFacingStatus(status: BuyOrderStatus): string {
  switch (status) {
    case 'ORDER_CREATED':
    case 'PAYMENT_PENDING':
      return 'Awaiting Payment';
    case 'PAYMENT_VERIFICATION':
      return 'Payment Submitted';
    case 'PAYMENT_CONFIRMED':
      return 'Payment Confirmed';
    case 'PROCESSING':
      return 'Processing';
    case 'USDT_SENT':
      return 'USDT Sent';
    case 'COMPLETED':
      return 'Completed';
    case 'REJECTED':
      return 'Payment Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}
