// ==========================================
// PENNY PAY ADMIN — Entity Types
// Conceptual entities for the admin panel.
// These map to future Django REST API models.
// ==========================================

// --- Admin Auth ---
export type AdminRole = 'SUPER_ADMIN' | 'OPERATIONS_ADMIN' | 'KYC_ADMIN' | 'SUPPORT_ADMIN';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  avatar?: string;
}

// --- Order Status Model ---
export type BuyOrderStatus =
  | 'ORDER_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'USDT_SENT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type SellOrderStatus =
  | 'ORDER_CREATED'
  | 'USDT_PENDING'
  | 'USDT_VERIFICATION'
  | 'USDT_RECEIVED'
  | 'PROCESSING'
  | 'INR_PAYOUT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type OrderType = 'BUY' | 'SELL';

// --- Payment ---
export type PaymentMethod = 'BANK_TRANSFER' | 'UPI';

export interface Receipt {
  id: string;
  filename: string;
  fileType: 'image' | 'pdf';
  mimeType: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface Payment {
  expectedAmount: number;
  method: PaymentMethod;
  status: BuyOrderStatus;
  receipt: Receipt | null;
}

// --- Wallet / Recipient ---
export type CryptoNetwork = 'TRC20' | 'ERC20' | 'BEP20';

export interface WalletRecipient {
  address: string;
  network: CryptoNetwork;
}

// --- Pricing ---
export interface OrderPrice {
  buyPrice: number;
  lockedAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  date: string;
  admin: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
}

export interface Pricing {
  currentBuyPrice: number;
  currentSellPrice: number;
  sellActive: boolean;
  history: PriceHistoryEntry[];
}

// --- KYC ---
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycRecord {
  id: string;
  customerId: string;
  customerName: string;
  status: KycStatus;
  providerReference: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

// --- Customer ---
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  kycStatus: KycStatus;
  kycReference: string | null;
  registeredAt: string;
  totalOrders: number;
  totalVolume: number;
}

// --- Admin Notes ---
export interface AdminNote {
  id: string;
  admin: string;
  timestamp: string;
  note: string;
}

// --- Status History / Timeline ---
export interface StatusHistoryEntry {
  id: string;
  status: BuyOrderStatus;
  timestamp: string;
  admin?: string;
  note?: string;
  txid?: string;
  rejectionReason?: string;
}

// --- Order ---
export interface Order {
  id: string;
  type: OrderType;
  customer: Customer;
  payment: Payment;
  wallet: WalletRecipient;
  price: OrderPrice;
  status: BuyOrderStatus;
  usdtAmount: number;
  inrAmount: number;
  createdAt: string;
  txid: string | null;
  notes: AdminNote[];
  statusHistory: StatusHistoryEntry[];
  rejectionReason?: string | null;
}

// --- Notifications ---
export type NotificationType = 'PAYMENT_RECEIPT' | 'KYC_SUBMITTED' | 'ORDER_PROCESSING' | 'ORDER_COMPLETED';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId: string;
  entityRoute: string;
  timestamp: string;
  read: boolean;
}

// --- Activity Log ---
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  previousStatus?: string;
  newStatus?: string;
  additionalInfo?: string;
}
