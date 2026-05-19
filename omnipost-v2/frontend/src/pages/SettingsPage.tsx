import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Link2, Bell, Shield, Globe, LogOut, CheckCircle2, AlertTriangle, Plus, RefreshCw, Trash2, ChevronRight } from 'lucide-react';
import { Card, Badge, PlatformIcon, Toggle } from '@/components/ui';
import { MOCK_ACCOUNTS, MOCK_USER } from '@/services/mockData';
import { PLATFORMS, PHASE_1_PLATFORMS, PHASE_2_PLATFORMS } from '@/constants/platforms';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User    },
  { id: 'accounts',  label: 'Connected Accounts', icon: Link2 },
  { id: 'notifs',    label: 'Notifications', icon: Bell },
  { id: 'security',  label: 'Security',  icon: Shield  },
];

export function SettingsPage() {
  const [tab, setTab] = useState('accounts');
  const { logout } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-display text-2xl font-bold text-text-primary">Settings</h2>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="sm:w-56 shrink-0">
          <Card className="p-2 space-y-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  tab === t.id ? 'bg-brand-600/20 text-brand-400' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary')}
              >
                <t.icon className="w-4 h-4"/>{t.label}
              </button>
            ))}
            <div className="divider my-2"/>
            <button onClick={() => { logout(); toast.success('Logged out'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-accent-rose hover:bg-accent-rose/10 transition-all text-left">
              <LogOut className="w-4 h-4"/>Logout
            </button>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile'  && <ProfileTab/>}
          {tab === 'accounts' && <AccountsTab/>}
          {tab === 'notifs'   && <NotifsTab/>}
          {tab === 'security' && <SecurityTab/>}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [name, setName] = useState(MOCK_USER.name);
  const [bio, setBio] = useState(MOCK_USER.bio ?? '');
  return (
    <Card className="p-6 space-y-5">
      <h3 className="font-display font-bold text-text-primary text-lg">Profile Information</h3>
      <div className="flex items-center gap-5">
        <div className="relative">
          <img src={MOCK_USER.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-600/30"/>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center shadow-glow-sm">
            <Plus className="w-3.5 h-3.5 text-white"/>
          </button>
        </div>
        <div>
          <p className="font-semibold text-text-primary">{MOCK_USER.name}</p>
          <p className="text-sm text-text-muted">{MOCK_USER.email}</p>
          <Badge variant="brand" className="mt-1 capitalize">{MOCK_USER.plan} Plan</Badge>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="form-input"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
          <input defaultValue={MOCK_USER.email} className="form-input" type="email"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Mobile</label>
          <input defaultValue={MOCK_USER.mobile} className="form-input" type="tel"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="form-input resize-none"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Language</label>
          <select className="form-input"><option>English</option><option>हिन्दी (Hindi)</option></select>
        </div>
      </div>
      <button onClick={() => toast.success('Profile updated!')} className="btn-primary">Save Changes</button>
    </Card>
  );
}

function AccountsTab() {
  return (
    <div className="space-y-5">
      {/* Connected accounts */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-4">Connected Accounts</h3>
        <div className="space-y-3">
          {MOCK_ACCOUNTS.map(acc => (
            <div key={acc.id} className="flex items-center gap-4 p-3 bg-bg-secondary rounded-xl border border-bg-border hover:border-bg-border-light transition-colors">
              <PlatformIcon platformId={acc.platform} size={36}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{acc.displayName}</p>
                <p className="text-xs text-text-muted">{acc.username} · {acc.followersCount?.toLocaleString('en-IN')} followers</p>
              </div>
              <div className="flex items-center gap-2">
                {acc.status === 'connected'
                  ? <Badge variant="success"><CheckCircle2 className="w-3 h-3"/>Connected</Badge>
                  : <Badge variant="warning"><AlertTriangle className="w-3 h-3"/>Reconnect</Badge>
                }
                {acc.status === 'expired' && (
                  <button onClick={() => toast.success('Reconnecting…')} className="btn-secondary text-xs py-1.5 px-3">
                    <RefreshCw className="w-3 h-3"/> Reconnect
                  </button>
                )}
                <button onClick={() => toast('Disconnected')} className="btn-icon text-accent-rose hover:bg-accent-rose/10">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Phase 1 platforms to add */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-1">Add Platform</h3>
        <p className="text-xs text-text-muted mb-4">Phase 1 — Available Now</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PHASE_1_PLATFORMS.map(p => {
            const connected = MOCK_ACCOUNTS.some(a => a.platform === p.id);
            return (
              <motion.button key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => toast.success(`Connecting to ${p.name}…`)}
                className={clsx('flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  connected ? 'border-bg-border bg-bg-secondary opacity-50 cursor-default' : 'border-bg-border bg-bg-secondary hover:border-brand-600/40 hover:bg-brand-600/5 cursor-pointer')}
              >
                <PlatformIcon platformId={p.id} size={28}/>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{p.name}</p>
                  {connected ? <p className="text-[10px] text-accent-emerald">Connected</p> : <p className="text-[10px] text-text-muted">Click to connect</p>}
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-xs text-text-muted mt-5 mb-3">Phase 2 — Coming Soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PHASE_2_PLATFORMS.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-secondary opacity-40">
              <PlatformIcon platformId={p.id} size={28}/>
              <div>
                <p className="text-xs font-semibold text-text-primary">{p.name}</p>
                <p className="text-[10px] text-text-muted">Coming Soon</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NotifsTab() {
  const [settings, setSettings] = useState({
    postSuccess: true, postFailed: true, tokenExpiry: true,
    scheduledReminder: true, weeklyReport: false, productUpdates: true,
  });
  return (
    <Card className="p-6 space-y-5">
      <h3 className="font-display font-bold text-text-primary text-lg">Notification Preferences</h3>
      <div className="space-y-4">
        {[
          { key: 'postSuccess',       label: 'Post published successfully', desc: 'Notify when all platforms succeed' },
          { key: 'postFailed',        label: 'Post failed',                  desc: 'Notify when publishing fails' },
          { key: 'tokenExpiry',       label: 'Token expiry alerts',          desc: 'Remind when platform auth expires' },
          { key: 'scheduledReminder', label: 'Scheduled post reminders',     desc: '15 min before scheduled posts' },
          { key: 'weeklyReport',      label: 'Weekly analytics report',      desc: 'Summary email every Monday' },
          { key: 'productUpdates',    label: 'Product updates',              desc: 'New features and announcements' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-bg-border">
            <div>
              <p className="text-sm font-semibold text-text-primary">{item.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={(settings as any)[item.key]} onChange={v => setSettings(s => ({ ...s, [item.key]: v }))}/>
          </div>
        ))}
      </div>
      <button onClick={() => toast.success('Notification settings saved!')} className="btn-primary">Save Preferences</button>
    </Card>
  );
}

function SecurityTab() {
  return (
    <Card className="p-6 space-y-5">
      <h3 className="font-display font-bold text-text-primary text-lg">Security Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Current Password</label>
          <input type="password" placeholder="••••••••" className="form-input"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">New Password</label>
          <input type="password" placeholder="Min 8 chars, uppercase, number, special char" className="form-input"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Confirm New Password</label>
          <input type="password" placeholder="••••••••" className="form-input"/>
        </div>
        <button onClick={() => toast.success('Password changed!')} className="btn-primary">Change Password</button>
        <div className="divider"/>
        <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-bg-border">
          <div>
            <p className="text-sm font-semibold text-text-primary">Two-Factor Authentication</p>
            <p className="text-xs text-text-muted mt-0.5">Protect your account with MFA via SMS OTP</p>
          </div>
          <button onClick={() => toast.success('MFA setup starting...')} className="btn-secondary text-sm py-2 px-4">Enable MFA</button>
        </div>
        <div className="divider"/>
        <div>
          <p className="text-sm font-semibold text-accent-rose mb-2">Danger Zone</p>
          <button onClick={() => toast.error('Account deletion requires email confirmation')} className="btn-secondary text-accent-rose border-accent-rose/30 text-sm">Delete Account</button>
        </div>
      </div>
    </Card>
  );
}
