import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity as ActivityIcon, XCircle } from 'lucide-react';
import { Card, SectionTitle, DetailRow, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { activityLogService } from '@/services';
import type { ActivityLogEntry } from '@/types';
import { formatDateTime } from '@/utils/format';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<ActivityLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    activityLogService.getActivityById(id).then((e) => {
      setEntry(e);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <EmptyState
            icon={<XCircle className="w-10 h-10" />}
            title="Activity not found."
            action={<Button variant="primary" onClick={() => navigate('/admin/activity')}>Back to Activity Log</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back link */}
      <Link to="/admin/activity" className="inline-flex items-center gap-1.5 text-sm text-pp-text-secondary hover:text-pp-text transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Activity Log
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-pp-accent-soft flex items-center justify-center">
          <ActivityIcon className="w-5 h-5 text-pp-accent" />
        </div>
        <h1 className="text-2xl font-semibold text-pp-text">{entry.action}</h1>
      </div>

      {/* Details */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <SectionTitle>Action Details</SectionTitle>
        </div>
        <DetailRow label="Action">
          <span className="font-medium">{entry.action}</span>
        </DetailRow>
        <DetailRow label="Admin">
          <span className="font-medium">{entry.admin}</span>
        </DetailRow>
        <DetailRow label="Timestamp">
          {formatDateTime(entry.timestamp)}
        </DetailRow>
        <DetailRow label="Entity">
          <span className="font-medium">{entry.entity}: {entry.entityId}</span>
        </DetailRow>
        {entry.previousStatus && (
          <DetailRow label="Previous Status">
            <span className="font-mono text-xs">{entry.previousStatus}</span>
          </DetailRow>
        )}
        {entry.newStatus && (
          <DetailRow label="New Status">
            <span className="font-mono text-xs">{entry.newStatus}</span>
          </DetailRow>
        )}
        <DetailRow label="Details">
          <span className="text-sm">{entry.details}</span>
        </DetailRow>
        {entry.additionalInfo && (
          <div className="mt-4 pt-4 border-t border-pp-border">
            <p className="text-xs text-pp-text-muted mb-1">Additional Information</p>
            <p className="text-sm text-pp-text-secondary">{entry.additionalInfo}</p>
          </div>
        )}
      </Card>

      {/* Audit notice */}
      <div className="flex items-start gap-3 p-4 bg-pp-bg-soft border border-pp-border rounded-lg">
        <ActivityIcon className="w-4 h-4 text-pp-text-muted flex-shrink-0 mt-0.5" />
        <p className="text-xs text-pp-text-muted">
          This activity log entry is part of the audit trail and is immutable.
        </p>
      </div>
    </div>
  );
}
