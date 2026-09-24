// ==========================================
// PENNY PAY ADMIN — Service Layer
// Mock API service abstractions.
// These mirror the conceptual API endpoints
// and can be replaced with real API calls later.
// ==========================================

import type {
  ActivityLogEntry,
  AdminNotification,
  AdminUser,
  BuyOrderStatus,
  Customer,
  KycRecord,
  KycStatus,
  Order,
  Pricing,
  PriceHistoryEntry,
} from '@/types';
import {
  activityLog as initialActivityLog,
  adminUsers,
  customers as initialCustomers,
  initialPricing,
  kycRecords as initialKycRecords,
  notifications as initialNotifications,
  orders as initialOrders,
} from '@/data/mockData';

// Simulate API latency
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// --- Mutable in-memory state (simulates backend) ---
let _orders: Order[] = [...initialOrders];
let _customers: Customer[] = [...initialCustomers];
let _kycRecords: KycRecord[] = [...initialKycRecords];
let _pricing: Pricing = { ...initialPricing };
let _notifications: AdminNotification[] = [...initialNotifications];
let _activityLog: ActivityLogEntry[] = [...initialActivityLog];
let _activityIdCounter = 100;

function addActivityLog(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void {
  _activityLog = [
    {
      ...entry,
      id: `act_${++_activityIdCounter}`,
      timestamp: new Date().toISOString(),
    },
    ..._activityLog,
  ];
}

function addNotification(notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): void {
  _notifications = [
    {
      ...notification,
      id: `ntf_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    },
    ..._notifications,
  ];
}

// ==========================================
// Auth Service
// ==========================================
export const authService = {
  async login(email: string, _password: string): Promise<AdminUser> {
    const user = adminUsers.find((u) => u.email === email) || adminUsers[0];
    return delay(user, 500);
  },
  async getCurrentUser(): Promise<AdminUser | null> {
    return delay(adminUsers[0], 100);
  },
  async logout(): Promise<void> {
    return delay(undefined, 100);
  },
};

// ==========================================
// Orders Service
// ==========================================
export const ordersService = {
  async getOrders(filters?: { status?: BuyOrderStatus; search?: string }): Promise<Order[]> {
    let result = [..._orders];
    if (filters?.status && filters.status !== 'ORDER_CREATED') {
      result = result.filter((o) => o.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.mobile.includes(q)
      );
    }
    return delay(result);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const order = _orders.find((o) => o.id === id);
    return delay(order || null);
  },

  async confirmPayment(orderId: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'PAYMENT_CONFIRMED';
    order.payment.status = 'PAYMENT_CONFIRMED';
    order.statusHistory = [
      ...order.statusHistory,
      {
        id: `sh_${Date.now()}`,
        status: 'PAYMENT_CONFIRMED',
        timestamp: now,
        admin,
        note: 'Payment verified through bank statement',
      },
    ];

    addActivityLog({
      admin,
      action: 'Payment Confirmed',
      entity: 'Order',
      entityId: orderId,
      details: 'Payment manually verified',
      previousStatus: 'PAYMENT_VERIFICATION',
      newStatus: 'PAYMENT_CONFIRMED',
      additionalInfo: 'Payment verified through bank statement.',
    });

    addNotification({
      type: 'ORDER_PROCESSING',
      title: 'ORDER READY FOR PROCESSING',
      message: `Payment confirmed for ${orderId}. Ready for USDT transfer.`,
      entityId: orderId,
      entityRoute: `/admin/orders/buy/${orderId}`,
    });

    return delay({ ...order });
  },

  async rejectPayment(orderId: string, reason: string, note: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    const rejectionReason = note ? `${reason} — ${note}` : reason;
    order.status = 'REJECTED';
    order.payment.status = 'REJECTED';
    order.rejectionReason = rejectionReason;
    order.statusHistory = [
      ...order.statusHistory,
      {
        id: `sh_${Date.now()}`,
        status: 'REJECTED',
        timestamp: now,
        admin,
        rejectionReason: reason,
        note: note || undefined,
      },
    ];

    addActivityLog({
      admin,
      action: 'Payment Rejected',
      entity: 'Order',
      entityId: orderId,
      details: `Payment rejected — ${rejectionReason}`,
      previousStatus: 'PAYMENT_VERIFICATION',
      newStatus: 'REJECTED',
      additionalInfo: note || undefined,
    });

    return delay({ ...order });
  },

  async startProcessing(orderId: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'PROCESSING';
    order.payment.status = 'PROCESSING';
    order.statusHistory = [
      ...order.statusHistory,
      {
        id: `sh_${Date.now()}`,
        status: 'PROCESSING',
        timestamp: now,
        admin,
      },
    ];

    addActivityLog({
      admin,
      action: 'Processing Started',
      entity: 'Order',
      entityId: orderId,
      details: 'USDT transfer processing started',
      previousStatus: 'PAYMENT_CONFIRMED',
      newStatus: 'PROCESSING',
    });

    return delay({ ...order });
  },

  async saveTxid(orderId: string, txid: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!txid.trim()) throw new Error('Transaction ID is required');

    order.txid = txid.trim();
    return delay({ ...order });
  },

  async markUsdtSent(orderId: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!order.txid) throw new Error('TXID is required before marking as sent');

    const now = new Date().toISOString();
    order.status = 'USDT_SENT';
    order.payment.status = 'USDT_SENT';
    order.statusHistory = [
      ...order.statusHistory,
      {
        id: `sh_${Date.now()}`,
        status: 'USDT_SENT',
        timestamp: now,
        admin,
        txid: order.txid,
      },
    ];

    addActivityLog({
      admin,
      action: 'TXID Added',
      entity: 'Order',
      entityId: orderId,
      details: 'Transaction ID recorded for USDT transfer',
      additionalInfo: `TXID: ${order.txid}`,
    });

    return delay({ ...order });
  },

  async completeOrder(orderId: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'COMPLETED';
    order.payment.status = 'COMPLETED';
    order.statusHistory = [
      ...order.statusHistory,
      {
        id: `sh_${Date.now()}`,
        status: 'COMPLETED',
        timestamp: now,
        admin,
      },
    ];

    addActivityLog({
      admin,
      action: 'Order Completed',
      entity: 'Order',
      entityId: orderId,
      details: 'Order marked as completed',
      previousStatus: 'USDT_SENT',
      newStatus: 'COMPLETED',
      additionalInfo: 'Customer notified.',
    });

    addNotification({
      type: 'ORDER_COMPLETED',
      title: 'ORDER COMPLETED',
      message: `${orderId} has been completed successfully.`,
      entityId: orderId,
      entityRoute: `/admin/orders/buy/${orderId}`,
    });

    return delay({ ...order });
  },

  async addNote(orderId: string, note: string, admin: string): Promise<Order> {
    const order = _orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.notes = [
      ...order.notes,
      {
        id: `n_${Date.now()}`,
        admin,
        timestamp: new Date().toISOString(),
        note,
      },
    ];

    return delay({ ...order });
  },
};

// ==========================================
// Customers Service
// ==========================================
export const customersService = {
  async getCustomers(filters?: { search?: string; kycStatus?: KycStatus }): Promise<Customer[]> {
    let result = [..._customers];
    if (filters?.kycStatus) {
      result = result.filter((c) => c.kycStatus === filters.kycStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
      );
    }
    return delay(result);
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const customer = _customers.find((c) => c.id === id);
    return delay(customer || null);
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const customerOrders = _orders.filter((o) => o.customer.id === customerId);
    return delay(customerOrders);
  },
};

// ==========================================
// KYC Service
// ==========================================
export const kycService = {
  async getKycRecords(filters?: { status?: KycStatus }): Promise<KycRecord[]> {
    let result = [..._kycRecords];
    if (filters?.status) {
      result = result.filter((k) => k.status === filters.status);
    }
    return delay(result);
  },

  async getKycById(id: string): Promise<KycRecord | null> {
    const record = _kycRecords.find((k) => k.id === id);
    return delay(record || null);
  },

  async approveKyc(id: string, admin: string): Promise<KycRecord> {
    const record = _kycRecords.find((k) => k.id === id);
    if (!record) throw new Error('KYC record not found');

    const now = new Date().toISOString();
    record.status = 'VERIFIED';
    record.reviewedAt = now;
    record.reviewedBy = admin;

    const customer = _customers.find((c) => c.id === record.customerId);
    if (customer) {
      customer.kycStatus = 'VERIFIED';
    }

    addActivityLog({
      admin,
      action: 'KYC Approved',
      entity: 'Customer',
      entityId: record.customerName,
      details: 'KYC verification approved',
      additionalInfo: `Provider Reference: ${record.providerReference}`,
    });

    return delay({ ...record });
  },

  async rejectKyc(id: string, reason: string, admin: string): Promise<KycRecord> {
    const record = _kycRecords.find((k) => k.id === id);
    if (!record) throw new Error('KYC record not found');

    const now = new Date().toISOString();
    record.status = 'REJECTED';
    record.reviewedAt = now;
    record.reviewedBy = admin;
    record.rejectionReason = reason;

    const customer = _customers.find((c) => c.id === record.customerId);
    if (customer) {
      customer.kycStatus = 'REJECTED';
    }

    addActivityLog({
      admin,
      action: 'KYC Rejected',
      entity: 'Customer',
      entityId: record.customerName,
      details: 'KYC verification rejected',
      additionalInfo: `Reason: ${reason}`,
    });

    return delay({ ...record });
  },
};

// ==========================================
// Pricing Service
// ==========================================
export const pricingService = {
  async getPricing(): Promise<Pricing> {
    return delay({ ..._pricing });
  },

  async updateBuyPrice(newPrice: number, reason: string, admin: string): Promise<Pricing> {
    const oldPrice = _pricing.currentBuyPrice;
    const entry: PriceHistoryEntry = {
      id: `ph_${Date.now()}`,
      date: new Date().toISOString(),
      admin,
      oldPrice,
      newPrice,
      reason: reason || 'No reason provided',
    };

    _pricing = {
      ..._pricing,
      currentBuyPrice: newPrice,
      history: [entry, ..._pricing.history],
    };

    addActivityLog({
      admin,
      action: 'Buy Price Changed',
      entity: 'Pricing',
      entityId: 'Pricing',
      details: `Buy price updated from Rs.${oldPrice} to Rs.${newPrice}`,
      additionalInfo: `Reason: ${reason || 'No reason provided'}`,
    });

    return delay({ ..._pricing });
  },
};

// ==========================================
// Notifications Service
// ==========================================
export const notificationsService = {
  async getNotifications(): Promise<AdminNotification[]> {
    return delay([..._notifications]);
  },

  async markAsRead(id: string): Promise<void> {
    _notifications = _notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return delay(undefined);
  },

  async markAllAsRead(): Promise<void> {
    _notifications = _notifications.map((n) => ({ ...n, read: true }));
    return delay(undefined);
  },
};

// ==========================================
// Activity Log Service
// ==========================================
export const activityLogService = {
  async getActivityLog(filters?: { admin?: string; action?: string; search?: string }): Promise<ActivityLogEntry[]> {
    let result = [..._activityLog];
    if (filters?.admin && filters.admin !== 'all') {
      result = result.filter((a) => a.admin === filters.admin);
    }
    if (filters?.action && filters.action !== 'all') {
      result = result.filter((a) => a.action === filters.action);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.entityId.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.admin.toLowerCase().includes(q)
      );
    }
    return delay(result);
  },

  async getActivityById(id: string): Promise<ActivityLogEntry | null> {
    const entry = _activityLog.find((a) => a.id === id);
    return delay(entry || null);
  },
};

// ==========================================
// Dashboard Service
// ==========================================
export const dashboardService = {
  async getMetrics() {
    const pendingVerification = _orders.filter((o) => o.status === 'PAYMENT_VERIFICATION').length;
    const processing = _orders.filter((o) => o.status === 'PROCESSING').length;
    const pendingKyc = _kycRecords.filter((k) => k.status === 'PENDING').length;
    const completedToday = _orders.filter(
      (o) => o.status === 'COMPLETED' && new Date(o.createdAt).toDateString() === new Date('2026-09-23').toDateString()
    ).length;

    return delay({
      pendingVerification,
      processing,
      pendingKyc,
      completedToday,
    });
  },

  async getNeedsAttention() {
    const needsAttention = _orders.filter((o) =>
      o.status === 'PAYMENT_VERIFICATION' || o.status === 'PROCESSING' || o.status === 'USDT_SENT'
    );
    const kycPending = _kycRecords.filter((k) => k.status === 'PENDING');
    return delay({ orders: needsAttention, kyc: kycPending });
  },

  async getRecentActivity(limit = 8) {
    return delay(_activityLog.slice(0, limit));
  },
};
