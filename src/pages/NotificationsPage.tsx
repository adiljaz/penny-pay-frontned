import { useNavigate } from 'react-router-dom';
import { Bell, FileText, ShieldCheck, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/context/NotificationContext';
import { formatDateTime } from '@/utils/format';

const notificationIcons = {
  PAYMENT_RECEIPT: { icon: FileText, color: 'text-pp-warning', bg: 'bg-pp-warning-soft' },
  KYC_SUBMITTED: { icon: ShieldCheck, color: 'text-pp-info', bg: 'bg-pp-info-soft' },
  ORDER_PROCESSING: { icon: Send, color: 'text-pp-accent', bg: 'bg-pp-accent-soft' },
  ORDER_COMPLETED: { icon: CheckCircle, color: 'text-pp-success', bg: 'bg-pp-success-soft' },
};

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (id: string, route: string, read: boolean) => {
    if (!read) markAsRead(id);
    navigate(route);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-pp-text-secondary">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All notifications read'}
        </p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card noPadding>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-10 h-10" />}
            title="No notifications."
            message="Operational notifications will appear here."
          />
        ) : (
          <div className="divide-y divide-pp-border">
            {notifications.map((n) => {
              const config = notificationIcons[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.entityRoute, n.read)}
                  className={`w-full flex items-start gap-3 px-5 py-4 hover:bg-pp-bg-soft transition-colors text-left ${
                    !n.read ? 'bg-pp-accent-soft/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-pp-text uppercase tracking-wide">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-pp-accent rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-pp-text-secondary mt-0.5">{n.message}</p>
                    <p className="text-xs text-pp-text-muted mt-1">{formatDateTime(n.timestamp)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pp-text-muted flex-shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
