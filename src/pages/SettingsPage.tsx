import { useState } from 'react';
import { Building2, CreditCard, Bell, Users, Lock, SlidersHorizontal, Shield, UserCog } from 'lucide-react';
import { Card, SectionTitle, DetailRow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { adminUsers } from '@/data/mockData';

type SettingsTab = 'business' | 'payment' | 'notifications' | 'users' | 'security' | 'system';

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'business', label: 'Business Settings', icon: Building2 },
  { id: 'payment', label: 'Payment Information', icon: CreditCard },
  { id: 'notifications', label: 'Notification Settings', icon: Bell },
  { id: 'users', label: 'Admin Users', icon: Users },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'system', label: 'System Preferences', icon: SlidersHorizontal },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const handleSave = () => {
    showToast('success', 'Settings saved.');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tabs sidebar */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pp-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pp-accent-soft text-pp-accent'
                    : 'text-pp-text-secondary hover:bg-pp-bg-soft hover:text-pp-text'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'business' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>Business Settings</SectionTitle>
              </div>
              <div className="space-y-4">
                <Input label="Company Name" defaultValue="PENNYBLACK LABS PRIVATE LIMITED" />
                <Input label="Brand Name" defaultValue="PENNY PAY" />
                <Input label="Support Email" defaultValue="support@pennypay.in" />
                <Input label="Support Phone" defaultValue="+91 93903 90933" />
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'payment' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>Payment Information</SectionTitle>
              </div>
              <div className="space-y-4">
                <Input label="Bank Account Name" defaultValue="PENNYBLACK LABS PRIVATE LIMITED" />
                <Input label="Bank Account Number" defaultValue="XXXX XXXX XXXX" />
                <Input label="Bank IFSC" defaultValue="HDFC0000XXX" />
                <Input label="UPI ID" defaultValue="pennypay@hdfcbank" />
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>Notification Settings</SectionTitle>
              </div>
              <div className="space-y-4">
                <ToggleRow label="New payment receipt" description="Notify when a customer uploads a payment receipt." defaultOn />
                <ToggleRow label="KYC submission" description="Notify when a customer submits KYC for review." defaultOn />
                <ToggleRow label="Order processing ready" description="Notify when an order is ready for USDT transfer." defaultOn />
                <ToggleRow label="Order completed" description="Notify when an order is completed." defaultOn />
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card noPadding>
              <div className="px-5 py-4 border-b border-pp-border flex items-center gap-2">
                <Users className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>Admin Users</SectionTitle>
              </div>
              <div className="divide-y divide-pp-border">
                {adminUsers.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-pp-accent-soft flex items-center justify-center text-sm font-semibold text-pp-accent">
                      {admin.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pp-text">{admin.username}</p>
                      <p className="text-xs text-pp-text-secondary">{admin.email}</p>
                    </div>
                    <Badge color={admin.role === 'SUPER_ADMIN' ? 'accent' : 'neutral'}>
                      {admin.role.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-pp-border">
                <p className="text-xs text-pp-text-muted">
                  Admin user management requires backend authorization. Future roles: SUPER_ADMIN, OPERATIONS_ADMIN, KYC_ADMIN, SUPPORT_ADMIN.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>Security</SectionTitle>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-pp-bg-soft rounded-lg border border-pp-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pp-text">Two-Factor Authentication</p>
                      <p className="text-xs text-pp-text-secondary mt-0.5">2FA-ready architecture. Enable for additional security.</p>
                    </div>
                    <Badge color="warning">Not Enabled</Badge>
                  </div>
                </div>
                <div className="p-4 bg-pp-bg-soft rounded-lg border border-pp-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pp-text">Session Management</p>
                      <p className="text-xs text-pp-text-secondary mt-0.5">Manage active admin sessions.</p>
                    </div>
                    <Button variant="ghost" size="sm">View Sessions</Button>
                  </div>
                </div>
                <div className="p-4 bg-pp-bg-soft rounded-lg border border-pp-border">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-pp-success" />
                    <p className="text-sm text-pp-text">All admin actions are logged in the Activity Log.</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-pp-text-muted" />
                <SectionTitle>System Preferences</SectionTitle>
              </div>
              <div className="space-y-4">
                <Select label="Default Currency" defaultValue="INR">
                  <option value="INR">Indian Rupee (INR)</option>
                </Select>
                <Select label="Default Crypto" defaultValue="USDT">
                  <option value="USDT">Tether (USDT)</option>
                </Select>
                <Select label="Date Format" defaultValue="DMY">
                  <option value="DMY">DD MMM YYYY</option>
                  <option value="MDY">MMM DD, YYYY</option>
                </Select>
                <Select label="Timezone" defaultValue="IST">
                  <option value="IST">India Standard Time (IST)</option>
                </Select>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn || false);
  return (
    <div className="flex items-center justify-between p-3 bg-pp-bg-soft rounded-lg border border-pp-border">
      <div>
        <p className="text-sm font-medium text-pp-text">{label}</p>
        <p className="text-xs text-pp-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-pp-accent' : 'bg-pp-border-strong'}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}
