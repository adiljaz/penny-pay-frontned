import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, SectionTitle, DetailRow, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { KycStatusBadge } from '@/components/shared/StatusBadge';
import { kycService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { KycRecord } from '@/types';
import { formatDate, formatDateTime } from '@/utils/format';

export function KycDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [record, setRecord] = useState<KycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const adminName = user?.username || 'admin_01';

  useEffect(() => {
    if (!id) return;
    kycService.getKycById(id).then((r) => {
      setRecord(r);
      setLoading(false);
    });
  }, [id]);

  const handleApprove = async () => {
    if (!record) return;
    setActionLoading(true);
    try {
      const updated = await kycService.approveKyc(record.id, adminName);
      setRecord(updated);
      showToast('success', 'KYC approved. Customer has been verified.');
    } catch {
      showToast('error', 'Unable to approve KYC. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!record || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await kycService.rejectKyc(record.id, rejectReason.trim(), adminName);
      setRecord(updated);
      setRejectModal(false);
      setRejectReason('');
      showToast('success', 'KYC rejected. Customer has been notified.');
    } catch {
      showToast('error', 'Unable to reject KYC. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <EmptyState
            icon={<XCircle className="w-10 h-10" />}
            title="KYC record not found."
            action={<Button variant="primary" onClick={() => navigate('/admin/kyc')}>Back to KYC</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back link */}
      <Link to="/admin/kyc" className="inline-flex items-center gap-1.5 text-sm text-pp-text-secondary hover:text-pp-text transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to KYC
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-pp-text">KYC Review</h1>
      </div>

      {/* Details */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-pp-text-muted" />
          <SectionTitle>KYC Information</SectionTitle>
        </div>
        <DetailRow label="Customer">
          <span className="font-medium">{record.customerName}</span>
        </DetailRow>
        <DetailRow label="Status">
          <KycStatusBadge status={record.status} />
        </DetailRow>
        <DetailRow label="Provider Reference">
          <span className="font-mono text-sm">{record.providerReference}</span>
        </DetailRow>
        <DetailRow label="Submitted">
          {record.submittedAt ? formatDate(record.submittedAt) : '—'}
        </DetailRow>
        {record.reviewedAt && (
          <DetailRow label="Reviewed">
            {formatDateTime(record.reviewedAt)}
          </DetailRow>
        )}
        {record.reviewedBy && (
          <DetailRow label="Reviewed By">
            <span className="font-medium">{record.reviewedBy}</span>
          </DetailRow>
        )}
        {record.rejectionReason && (
          <div className="mt-4 pt-4 border-t border-pp-border">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-pp-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-pp-error">Rejection Reason</p>
                <p className="text-sm text-pp-text-secondary mt-1">{record.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      {record.status === 'PENDING' && (
        <Card className="border-pp-warning-border bg-pp-warning-soft/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-pp-warning" />
            <SectionTitle>Manual Review Required</SectionTitle>
          </div>
          <p className="text-sm text-pp-text-secondary mb-4">
            Review the KYC submission from the provider. If the information is correct, approve the KYC. If there are issues, reject with a reason.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove} loading={actionLoading}>
              Approve
            </Button>
            <Button variant="danger" size="md" icon={<XCircle className="w-4 h-4" />} onClick={() => setRejectModal(true)}>
              Reject
            </Button>
          </div>
        </Card>
      )}

      {record.status === 'VERIFIED' && (
        <Card className="border-pp-success-border bg-pp-success-soft/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-pp-success" />
            <span className="text-sm font-medium text-pp-success">KYC Verified</span>
          </div>
        </Card>
      )}

      {record.status === 'REJECTED' && (
        <Card className="border-pp-error-border bg-pp-error-soft/30">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-pp-error" />
            <span className="text-sm font-medium text-pp-error">KYC Rejected</span>
          </div>
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject KYC"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setRejectModal(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="danger" size="md" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>
              Reject KYC
            </Button>
          </>
        }
      >
        <p className="text-sm text-pp-text mb-4">
          This will reject the KYC for {record.customerName} and notify the customer.
        </p>
        <Textarea
          label="Reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Provide a reason for rejection..."
          rows={3}
        />
      </Modal>
    </div>
  );
}
