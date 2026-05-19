import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PenSquare, CalendarDays, BarChart3,
  ImageIcon, Settings, ChevronRight, Zap, Plus,
  Radio, Star, Users, HelpCircle, CreditCard,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/',          badge: null },
  { icon: PenSquare,       label: 'Compose',       path: '/compose',   badge: null },
  { icon: CalendarDays,    label: 'Calendar',      path: '/calendar',  badge: null },
  { icon: BarChart3,       label: 'Analytics',     path: '/analytics', badge: null },
  { icon: ImageIcon,       label: 'Media Library', path: '/media',     badge: null },
];

const BOTTOM_NAV = [
  { icon: CreditCard,  label: 'Billing',   path: '/billing'  },
  { icon: HelpCircle,  label: 'Help',      path: '/help'     },
  { icon: Settings,    label: 'Settings',  path: '/settings' },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { sidebarOpen, openComposer } = useUIStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-[100] flex flex-col w-[260px] bg-gradient-sidebar border-r border-bg-border overflow-hidden"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-bg-border shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-text-primary tracking-tight">OmniPost</span>
            </div>
          </div>

          {/* Quick Compose Button */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openComposer}
              className="btn-primary w-full justify-center gap-2 py-3"
            >
              <Plus className="w-4 h-4" />
              <span className="font-display font-semibold">New Post</span>
            </motion.button>
          </div>

          {/* Main Nav */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Manage
            </p>
            {NAV_ITEMS.map((item) => {
              const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={clsx('nav-link', active && 'active')}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                  </motion.div>
                </Link>
              );
            })}

            {/* Connected platforms section */}
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Platforms
            </p>
            <ConnectedPlatformsMini />

            {/* Upgrade banner */}
            {user?.plan === 'free' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-1 mt-4 p-3 rounded-xl bg-brand-600/15 border border-brand-600/25"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className="w-3.5 h-3.5 text-accent-amber" fill="currentColor" />
                  <span className="text-xs font-semibold text-text-primary">Upgrade to Creator</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-2.5">
                  Unlimited posts, scheduling & advanced analytics.
                </p>
                <Link to="/billing" className="block text-center py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors">
                  Upgrade — ₹499/mo
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Bottom nav */}
          <div className="px-3 pb-4 border-t border-bg-border pt-3 shrink-0">
            {BOTTOM_NAV.map((item) => {
              const active = pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div whileHover={{ x: 2 }} className={clsx('nav-link', active && 'active')}>
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}

            {/* User profile */}
            <Link to="/settings/profile">
              <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-600/30">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                  <p className="text-[11px] text-text-muted capitalize">{user?.plan} plan</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </div>
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ConnectedPlatformsMini() {
  const platforms = [
    { name: 'Instagram', color: '#E1306C', icon: '📸', connected: true },
    { name: 'Twitter',   color: '#1DA1F2', icon: '𝕏',  connected: true },
    { name: 'Facebook',  color: '#1877F2', icon: '👍', connected: true },
    { name: 'YouTube',   color: '#FF0000', icon: '▶️', connected: true },
    { name: 'LinkedIn',  color: '#0A66C2', icon: '💼', connected: false },
    { name: 'Threads',   color: '#e5e7eb', icon: '@',  connected: true },
  ];

  return (
    <div className="px-3 py-1">
      <div className="flex flex-wrap gap-1.5">
        {platforms.map((p) => (
          <div
            key={p.name}
            title={`${p.name}${!p.connected ? ' — Reconnect needed' : ''}`}
            className={clsx(
              'w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-opacity',
              !p.connected && 'opacity-35 grayscale'
            )}
            style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
          >
            {p.icon}
          </div>
        ))}
        <Link to="/settings/accounts" title="Add platform">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs border border-dashed border-bg-border text-text-muted hover:border-brand-600/50 hover:text-brand-400 transition-colors cursor-pointer">
            +
          </div>
        </Link>
      </div>
    </div>
  );
}
