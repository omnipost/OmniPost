import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Search, SunMoon, ChevronDown, CheckCircle2,
  AlertTriangle, Clock, X
} from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_NOTIFICATIONS } from '@/services/mockData';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/':          { title: 'Dashboard',     subtitle: 'Welcome back 👋' },
  '/compose':   { title: 'New Post',      subtitle: 'Create & publish to all platforms' },
  '/calendar':  { title: 'Content Calendar', subtitle: 'Plan your content strategy' },
  '/analytics': { title: 'Analytics',    subtitle: 'Track your performance' },
  '/media':     { title: 'Media Library', subtitle: 'All your uploaded assets' },
  '/settings':  { title: 'Settings',     subtitle: 'Manage your account' },
  '/billing':   { title: 'Billing',      subtitle: 'Manage your subscription' },
};

export function Header() {
  const { pathname } = useLocation();
  const { toggleSidebar, notifications } = useUIStore();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pageInfo = PAGE_TITLES[pathname] || { title: 'OmniPost' };
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 z-[90] border-b border-bg-border bg-bg-primary/80 backdrop-blur-md flex items-center px-6 gap-4">
      {/* Toggle sidebar */}
      <button onClick={toggleSidebar} className="btn-icon lg:hidden shrink-0">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg font-bold text-text-primary leading-none">{pageInfo.title}</h1>
        {pageInfo.subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{pageInfo.subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                type="text"
                placeholder="Search posts, media..."
                className="w-full form-input py-2 pr-8 text-sm"
                onBlur={() => setSearchOpen(false)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-7 h-7" onClick={() => setSearchOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="btn-icon">
              <Search className="w-4.5 h-4.5" />
            </button>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="btn-icon relative"
        >
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span className="notif-dot">{unread}</span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card p-0 overflow-hidden z-20"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
                  <span className="font-display font-bold text-sm">Notifications</span>
                  {unread > 0 && (
                    <button className="text-xs text-brand-400 hover:text-brand-300 font-medium">Mark all read</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-bg-border">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <NotifItem key={n.id} notif={n} />
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-bg-border text-center">
                  <button className="text-xs text-text-secondary hover:text-text-primary font-medium">View all notifications</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function NotifItem({ notif }: { notif: typeof MOCK_NOTIFICATIONS[0] }) {
  const icons = {
    post_success:        <CheckCircle2 className="w-4 h-4 text-accent-emerald" />,
    post_failed:         <AlertTriangle className="w-4 h-4 text-accent-rose" />,
    post_partial:        <AlertTriangle className="w-4 h-4 text-accent-amber" />,
    token_expired:       <AlertTriangle className="w-4 h-4 text-accent-amber" />,
    scheduled_reminder:  <Clock className="w-4 h-4 text-accent-cyan" />,
    feature_announcement:<CheckCircle2 className="w-4 h-4 text-brand-400" />,
    billing:             <CheckCircle2 className="w-4 h-4 text-text-secondary" />,
  };

  return (
    <div className={clsx('flex gap-3 px-4 py-3 transition-colors hover:bg-bg-hover cursor-pointer', !notif.isRead && 'bg-brand-600/5')}>
      <div className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center shrink-0 mt-0.5">
        {icons[notif.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-xs font-semibold leading-snug', notif.isRead ? 'text-text-secondary' : 'text-text-primary')}>{notif.title}</p>
        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{notif.message}</p>
        <p className="text-[10px] text-text-disabled mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
      </div>
      {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />}
    </div>
  );
}
