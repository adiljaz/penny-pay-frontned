import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Inbox, Eye } from 'lucide-react';
import { Card, EmptyState, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KycStatusBadge } from '@/components/shared/StatusBadge';
import { kycService } from '@/services';
import type { KycRecord, KycStatus } from '@/types';
import { formatDate } from '@/utils/format';

const tabs: { label: string; value: KycStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export function KycPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<KycStatus>(
    (searchParams.get('status') as KycStatus) || 'PENDING'
  );

  useEffect(() => {
    setLoading(true);
    kycService.getKycRecords({ status: activeTab }).then((result) => {
      setRecords(result);
      setLoading(false);
    });
  }, [activeTab]);

  const handleTabChange = (tab: KycStatus) => {
    setActiveTab(tab);
    setSearchParams({ status: tab });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-pp-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.value
                ? 'border-pp-accent text-pp-accent'
                : 'border-transparent text-pp-text-secondary hover:text-pp-text'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-pp-bg-soft text-pp-text-muted">
              {tab.value === activeTab ? records.length : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 mb-2" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-10 h-10" />}
            title={`No ${activeTab.toLowerCase()} KYC requests.`}
            message={`There are no ${activeTab.toLowerCase()} KYC records to display.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pp-border bg-pp-bg-soft">
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Provider Reference</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-pp-bg-soft transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-pp-text">{record.customerName}</td>
                    <td className="px-4 py-3"><KycStatusBadge status={record.status} /></td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary">
                      {record.submittedAt ? formatDate(record.submittedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-pp-text-secondary">{record.providerReference}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/kyc/${record.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
