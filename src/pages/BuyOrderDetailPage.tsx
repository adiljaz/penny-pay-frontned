import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Wallet,
  CreditCard,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  StickyNote,
  Plus,
} from 'lucide-react';
import { Card, Card as CardComp, SectionTitle, DetailRow, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ReceiptViewer } from '@/components/shared/ReceiptViewer';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ordersService } from '@/services';
import type { Order } from '@/types';
import { formatINR, formatUSDT, formatPricePerUSDT, formatDateTime, truncateAddress, copyToClipboard } from '@/utils/format';
import { statusMeta, getAvailableActions } from '@/utils/status';

export function BuyOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [processingModal, setProcessingModal] = useState(false);
  const [txidModal, setTxidModal] = useState(false);
  const [txidValue, setTxidValue] = useState('');
  const [txidError, setTxidError] = useState('');
  const [usdtSentModal, setUsdtSentModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);

  const adminName = user?.username || 'admin_01';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ordersService.getOrderById(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  const refreshOrder = () => {
    if (!id) return;
    ordersService.getOrderById(id).then(setOrder);
  };

  const handleCopyAddress = async () => {
    if (!order) return;
    await copyToClipboard(order.wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Confirm Payment ---
  const handleConfirmPayment = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await ordersService.confirmPayment(order.id, adminName);
      setOrder(updated);
      setConfirmModal(false);
      showToast('success', 'Payment confirmed. Order is now ready for processing.');
    } catch {
      showToast('error', 'Unable to confirm payment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Reject Payment ---
  const handleRejectPayment = async () => {
    if (!order || !rejectReason) return;
    setActionLoading(true);
    try {
      const updated = await ordersService.rejectPayment(order.id, rejectReason, rejectNote, adminName);
      setOrder(updated);
      setRejectModal(false);
      setRejectReason('');
      setRejectNote('');
      showToast('success', 'Payment rejected. Customer has been notified.');
    } catch {
      showToast('error', 'Unable to reject payment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Start Processing ---
  const handleStartProcessing = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await ordersService.startProcessing(order.id, adminName);
      setOrder(updated);
      setProcessingModal(false);
      showToast('success', 'Processing started. Ready to enter TXID.');
    } catch {
      showToast('error', 'Unable to start processing. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Save TXID ---
  const handleSaveTxid = async () => {
    if (!order) return;
    if (!txidValue.trim()) {
      setTxidError('Transaction ID is required.');
      return;
    }
    if (txidValue.trim().length < 10) {
      setTxidError('Transaction ID appears too short. Please check and try again.');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await ordersService.saveTxid(order.id, txidValue.trim(), adminName);
      setOrder(updated);
      setTxidModal(false);
      setTxidValue('');
      setTxidError('');
      showToast('success', 'Transaction ID saved.');
      // Auto-open the USDT Sent confirmation
      setUsdtSentModal(true);
    } catch {
      showToast('error', 'Unable to save TXID.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Mark USDT Sent ---
  const handleMarkUsdtSent = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await ordersService.markUsdtSent(order.id, adminName);
      setOrder(updated);
      setUsdtSentModal(false);
      showToast('success', 'USDT transfer has been recorded.');
    } catch {
      showToast('error', 'Unable to mark USDT as sent.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Complete Order ---
  const handleCompleteOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await ordersService.completeOrder(order.id, adminName);
      setOrder(updated);
      setCompleteModal(false);
      showToast('success', 'Order completed. Customer has been notified.');
    } catch {
      showToast('error', 'Unable to complete order.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Add Note ---
  const handleAddNote = async () => {
    if (!order || !noteText.trim()) return;
    setAddingNote(true);
    try {
      const updated = await ordersService.addNote(order.id, noteText.trim(), adminName);
      setOrder(updated);
      setNoteText('');
      showToast('success', 'Note added.');
    } catch {
      showToast('error', 'Unable to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <EmptyState
            icon={<XCircle className="w-10 h-10" />}
            title="Order not found."
            message={`Order ${id} could not be loaded.`}
            action={<Button variant="primary" onClick={() => navigate('/admin/orders/buy')}>Back to Buy Orders</Button>}
          />
        </Card>
      </div>
    );
  }

  const actions = getAvailableActions(order.status);
  const meta = statusMeta[order.status];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/admin/orders/buy" className="inline-flex items-center gap-1.5 text-sm text-pp-text-secondary hover:text-pp-text transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Buy Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-pp-text">{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-pp-text-secondary mt-1">
            Created: {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Action buttons based on status */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions.includes('CONFIRM_PAYMENT') && (
            <Button variant="primary" size="md" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setConfirmModal(true)}>
              Confirm Payment
            </Button>
          )}
          {actions.includes('REJECT_PAYMENT') && (
            <Button variant="danger" size="md" icon={<XCircle className="w-4 h-4" />} onClick={() => setRejectModal(true)}>
              Reject Payment
            </Button>
          )}
          {actions.includes('START_PROCESSING') && (
            <Button variant="primary" size="md" icon={<Send className="w-4 h-4" />} onClick={() => setProcessingModal(true)}>
              Start Processing
            </Button>
          )}
          {actions.includes('ENTER_TXID') && (
            <Button variant="primary" size="md" icon={<FileText className="w-4 h-4" />} onClick={() => setTxidModal(true)}>
              Enter TXID
            </Button>
          )}
          {actions.includes('COMPLETE_ORDER') && (
            <Button variant="primary" size="md" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setCompleteModal(true)}>
              Mark Order Completed
            </Button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Customer</SectionTitle>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-pp-text">{order.customer.name}</p>
                <p className="text-sm text-pp-text-secondary mt-0.5">{order.customer.mobile}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-pp-text-muted">KYC:</span>
                  {order.customer.kycStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-pp-success">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : order.customer.kycStatus === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-pp-warning">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-pp-error">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                </div>
                <p className="text-xs text-pp-text-muted mt-1.5">
                  Registered: {formatDateTime(order.customer.registeredAt)}
                </p>
              </div>
              <Link to={`/admin/customers/${order.customer.id}`}>
                <Button variant="ghost" size="sm">View Customer</Button>
              </Link>
            </div>
          </Card>

          {/* Purchase */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Purchase</SectionTitle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
                <p className="text-xs text-pp-text-muted mb-1">USDT Amount</p>
                <p className="text-xl font-semibold text-pp-text tabular-nums">{formatUSDT(order.usdtAmount)}</p>
              </div>
              <div className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
                <p className="text-xs text-pp-text-muted mb-1">INR Amount</p>
                <p className="text-xl font-semibold text-pp-text tabular-nums">{formatINR(order.inrAmount)}</p>
              </div>
              <div className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
                <p className="text-xs text-pp-text-muted mb-1">Buy Price</p>
                <p className="text-xl font-semibold text-pp-text tabular-nums">{formatPricePerUSDT(order.price.buyPrice)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-pp-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>Rate locked at {formatDateTime(order.price.lockedAt)}</span>
            </div>
          </Card>

          {/* USDT Recipient */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>USDT Recipient</SectionTitle>
            </div>
            <DetailRow label="Wallet Address">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{truncateAddress(order.wallet.address, 10, 6)}</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-pp-text-muted hover:text-pp-accent transition-colors"
                  aria-label="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-pp-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </DetailRow>
            <DetailRow label="Network">
              <span className="font-medium">{order.wallet.network}</span>
            </DetailRow>
          </Card>

          {/* Payment */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Payment</SectionTitle>
            </div>
            <DetailRow label="Expected Amount" mono>
              {formatINR(order.payment.expectedAmount)}
            </DetailRow>
            <DetailRow label="Payment Method">
              {order.payment.method === 'BANK_TRANSFER' ? 'Bank Transfer' : 'UPI'}
            </DetailRow>
            <DetailRow label="Payment Status">
              <StatusBadge status={order.payment.status} short />
            </DetailRow>

            {/* Receipt */}
            {order.payment.receipt ? (
              <div className="mt-4 pt-4 border-t border-pp-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-pp-text-muted mb-1">Receipt</p>
                    <p className="text-sm font-medium text-pp-text">{order.payment.receipt.filename}</p>
                    <p className="text-xs text-pp-text-muted mt-1">
                      Uploaded: {formatDateTime(order.payment.receipt.uploadedAt)}
                    </p>
                  </div>
                  <ReceiptViewer receipt={order.payment.receipt} />
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-pp-border">
                <p className="text-sm text-pp-text-muted italic">No receipt uploaded.</p>
              </div>
            )}
          </Card>

          {/* TXID (if present) */}
          {order.txid && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-pp-text-muted" />
                <SectionTitle>Transaction ID</SectionTitle>
              </div>
              <div className="p-3 bg-pp-info-soft border border-pp-info-border rounded-lg">
                <p className="text-xs text-pp-info mb-1">TXID</p>
                <p className="text-sm font-mono text-pp-text break-all">{order.txid}</p>
              </div>
            </Card>
          )}

          {/* Rejection info */}
          {order.status === 'REJECTED' && order.rejectionReason && (
            <Card className="border-pp-error-border">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-pp-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-pp-error">Payment Rejected</p>
                  <p className="text-sm text-pp-text-secondary mt-1">{order.rejectionReason}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Admin Notes */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Admin Notes</SectionTitle>
              <span className="text-xs text-pp-text-muted ml-auto">Internal — not visible to customer</span>
            </div>

            {order.notes.length > 0 && (
              <div className="space-y-3 mb-4">
                {order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
                    <p className="text-sm text-pp-text">{note.note}</p>
                    <p className="text-xs text-pp-text-muted mt-2">
                      {note.admin} · {formatDateTime(note.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add internal note..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && noteText.trim()) handleAddNote();
                }}
              />
              <Button
                variant="secondary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddNote}
                loading={addingNote}
                disabled={!noteText.trim()}
              >
                Add
              </Button>
            </div>
          </Card>
        </div>

        {/* Right column: timeline */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-pp-text-muted" />
              <SectionTitle>Order Timeline</SectionTitle>
            </div>
            <OrderTimeline history={order.statusHistory} currentStatus={order.status} />
          </Card>

          {/* Status action card */}
          {(order.status === 'PAYMENT_CONFIRMED' || order.status === 'PROCESSING' || order.status === 'USDT_SENT') && (
            <Card className="border-pp-accent-border bg-pp-accent-soft/30">
              <SectionTitle className="mb-3">Next Action</SectionTitle>
              {order.status === 'PAYMENT_CONFIRMED' && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-pp-success" />
                    <span className="text-sm text-pp-text">Payment verified</span>
                  </div>
                  <div className="text-xs text-pp-text-secondary mb-3 space-y-1">
                    <p>USDT to send: <span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></p>
                    <p>Recipient: <span className="font-mono">{truncateAddress(order.wallet.address)}</span></p>
                    <p>Network: <span className="font-medium text-pp-text">{order.wallet.network}</span></p>
                  </div>
                  <Button variant="primary" size="md" className="w-full" icon={<Send className="w-4 h-4" />} onClick={() => setProcessingModal(true)}>
                    Start Processing
                  </Button>
                </>
              )}
              {order.status === 'PROCESSING' && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="w-4 h-4 text-pp-accent animate-spin" />
                    <span className="text-sm text-pp-text">USDT transfer in progress</span>
                  </div>
                  <div className="text-xs text-pp-text-secondary mb-3 space-y-1">
                    <p>Amount: <span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></p>
                    <p>Recipient: <span className="font-mono">{truncateAddress(order.wallet.address)}</span></p>
                    <p>Network: <span className="font-medium text-pp-text">{order.wallet.network}</span></p>
                  </div>
                  <p className="text-xs text-pp-text-muted mb-3">
                    Send USDT externally, then return to enter the TXID.
                  </p>
                  <Button variant="primary" size="md" className="w-full" icon={<FileText className="w-4 h-4" />} onClick={() => setTxidModal(true)}>
                    Enter TXID
                  </Button>
                </>
              )}
              {order.status === 'USDT_SENT' && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-pp-info" />
                    <span className="text-sm text-pp-text">Transaction recorded</span>
                  </div>
                  <div className="text-xs text-pp-text-secondary mb-3 space-y-1">
                    <p>TXID: <span className="font-mono break-all">{order.txid && truncateAddress(order.txid, 8, 6)}</span></p>
                  </div>
                  <Button variant="primary" size="md" className="w-full" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setCompleteModal(true)}>
                    Mark Order Completed
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* === MODALS === */}

      {/* Confirm Payment */}
      <ConfirmDialog
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmPayment}
        title="Confirm Payment"
        description="Confirm that you have verified the payment externally."
        details={
          <>
            <div className="flex justify-between"><span className="text-pp-text-muted">Order</span><span className="font-medium text-pp-text">{order.id}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Customer</span><span className="font-medium text-pp-text">{order.customer.name}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Expected Amount</span><span className="font-medium text-pp-text tabular-nums">{formatINR(order.payment.expectedAmount)}</span></div>
          </>
        }
        confirmLabel="Confirm Payment"
        loading={actionLoading}
      />

      {/* Reject Payment */}
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setRejectModal(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="danger" size="md" onClick={handleRejectPayment} loading={actionLoading} disabled={!rejectReason}>
              Reject Payment
            </Button>
          </>
        }
      >
        <p className="text-sm text-pp-text mb-4">
          This will mark the payment as rejected and notify the customer.
        </p>
        <div className="space-y-4">
          <Select
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          >
            <option value="">Select reason...</option>
            <option value="Amount mismatch">Amount mismatch</option>
            <option value="Payment not received">Payment not received</option>
            <option value="Invalid receipt">Invalid receipt</option>
            <option value="Duplicate payment">Duplicate payment</option>
            <option value="Other">Other</option>
          </Select>
          <Textarea
            label="Additional note (optional)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Provide additional details..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Start Processing */}
      <ConfirmDialog
        open={processingModal}
        onClose={() => setProcessingModal(false)}
        onConfirm={handleStartProcessing}
        title="Start Processing"
        description="This will move the order to Processing status. You will need to send USDT externally and record the TXID."
        details={
          <>
            <div className="flex justify-between"><span className="text-pp-text-muted">Order</span><span className="font-medium text-pp-text">{order.id}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">USDT to send</span><span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Network</span><span className="font-medium text-pp-text">{order.wallet.network}</span></div>
          </>
        }
        confirmLabel="Start Processing"
        loading={actionLoading}
      />

      {/* Enter TXID */}
      <Modal
        open={txidModal}
        onClose={() => { setTxidModal(false); setTxidError(''); }}
        title="Enter Transaction ID"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => { setTxidModal(false); setTxidError(''); }} disabled={actionLoading}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleSaveTxid} loading={actionLoading}>Save TXID</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-pp-bg-soft rounded-lg border border-pp-border text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-pp-text-muted">Amount</span><span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Recipient</span><span className="font-mono text-pp-text">{truncateAddress(order.wallet.address, 8, 6)}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Network</span><span className="font-medium text-pp-text">{order.wallet.network}</span></div>
          </div>
          <Input
            label="Transaction ID / TXID"
            value={txidValue}
            onChange={(e) => { setTxidValue(e.target.value); setTxidError(''); }}
            placeholder="Enter the blockchain transaction ID"
            error={txidError}
          />
          <p className="text-xs text-pp-text-muted">
            Enter the TXID after you have sent the USDT externally. Do not enter a fake TXID.
          </p>
        </div>
      </Modal>

      {/* Mark USDT Sent */}
      <ConfirmDialog
        open={usdtSentModal}
        onClose={() => setUsdtSentModal(false)}
        onConfirm={handleMarkUsdtSent}
        title="Mark USDT as Sent?"
        description="This will record the USDT transfer and notify the customer."
        details={
          <>
            <div className="flex justify-between"><span className="text-pp-text-muted">Amount</span><span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Recipient</span><span className="font-mono text-pp-text">{truncateAddress(order.wallet.address, 8, 6)}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">TXID</span><span className="font-mono text-pp-text text-xs">{order.txid && truncateAddress(order.txid, 8, 6)}</span></div>
          </>
        }
        confirmLabel="Confirm"
        loading={actionLoading}
      />

      {/* Complete Order */}
      <ConfirmDialog
        open={completeModal}
        onClose={() => setCompleteModal(false)}
        onConfirm={handleCompleteOrder}
        title="Complete Order?"
        description={`This will mark ${order.id} as completed and notify the customer.`}
        details={
          <>
            <div className="flex justify-between"><span className="text-pp-text-muted">Order</span><span className="font-medium text-pp-text">{order.id}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">Customer</span><span className="font-medium text-pp-text">{order.customer.name}</span></div>
            <div className="flex justify-between"><span className="text-pp-text-muted">USDT</span><span className="font-medium text-pp-text">{formatUSDT(order.usdtAmount)}</span></div>
          </>
        }
        confirmLabel="Complete Order"
        loading={actionLoading}
      />
    </div>
  );
}
