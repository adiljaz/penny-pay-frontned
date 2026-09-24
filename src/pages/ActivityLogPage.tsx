import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityIcon, Inbox, Search } from 'lucide-react';
import { Card, EmptyState, Skeleton } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { activityLogService } from '@/services';
import type { ActivityLogEntry } from '@/types';
import { formatDateTime } from '@/utils/format';

export function ActivityLogPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    activityLogService
      .getActivityLog({
        admin: adminFilter,
        action: actionFilter,
        search: search || undefined,
      })
      .then((result) => {
        setEntries(result);
        setLoading(false);
      });
  }, [search, adminFilter, actionFilter]);

  const uniqueActions = [...new Set(entries.map((e) => e.action))];

  const handleClick = (entry: ActivityLogEntry) => {
    navigate(`/admin/activity/${entry.id}`);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by entity, action, details..."
          prefix={<Search className="w-4 h-4" />}
        />
        <Select value={adminFilter} onChange={(e) => setAdminFilter(e.target.value)}>
          <option value="all">All Admins</option>
          <option value="admin_01">admin_01</option>
          <option value="admin_02">ops_01</option>
          <option value="admin_03">kyc_01</option>
        </Select>
        <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 mb-2" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<ActivityIcon className="w-10 h-10" />}
            title="No activity recorded yet."
            message="Operational actions will be logged here for audit purposes."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pp-border bg-pp-bg-soft">
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pp-text-secondary">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pp-border">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleClick(entry)}
                    className="hover:bg-pp-bg-soft transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm text-pp-text-secondary whitespace-nowrap">{formatDateTime(entry.timestamp)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-pp-text">{entry.admin}</td>
                    <td className="px-4 py-3 text-sm font-medium text-pp-text">{entry.action}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary tabular-nums">{entry.entityId}</td>
                    <td className="px-4 py-3 text-sm text-pp-text-secondary max-w-xs truncate">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && entries.length > 0 && (
        <p className="text-xs text-pp-text-muted text-center">
          Showing {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
        </p>
      )}
    </div>
  );
}
