import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/* ─── Card ──────────────────────────────────────────────────────── */
export function Card({
  children, className = '', hover = false, onClick,
}: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      className={clsx(hover ? 'glass-card-hover' : 'glass-card', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ─── Badge ──────────────────────────────────────────────────────── */
type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'brand';
const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/25',
  error:   'bg-accent-rose/15    text-accent-rose    border-accent-rose/25',
  warning: 'bg-accent-amber/15   text-accent-amber   border-accent-amber/25',
  info:    'bg-accent-cyan/15    text-accent-cyan    border-accent-cyan/25',
  brand:   'bg-brand-600/15      text-brand-400      border-brand-600/25',
  default: 'bg-bg-hover          text-text-secondary border-bg-border',
};
export function Badge({
  children, variant = 'default', className = '',
}: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', BADGE_STYLES[variant], className)}>
      {children}
    </span>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────── */
export function StatCard({
  label, value, delta, icon: Icon, color = '#6366f1', suffix = '',
}: {
  label: string; value: string | number; delta?: number;
  icon?: React.ElementType; color?: string; suffix?: string;
}) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary font-medium">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
        )}
      </div>
      <div>
        <div className="font-display text-3xl font-bold text-text-primary">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          {suffix && <span className="text-lg text-text-secondary ml-1">{suffix}</span>}
        </div>
        {delta !== undefined && (
          <div className={clsx('flex items-center gap-1 mt-1 text-xs font-medium', positive ? 'text-accent-emerald' : 'text-accent-rose')}>
            <span>{positive ? '↑' : '↓'} {Math.abs(delta)}%</span>
            <span className="text-text-muted font-normal">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Progress ───────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color = '' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={color ? { background: color } : undefined}
      />
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────── */
export function Modal({
  open, onClose, title, children, size = 'md',
}: {
  open: boolean; onClose: () => void; title?: string;
  children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}) {
  const sizeClasses = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-6xl',
  };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={clsx('relative w-full glass-card overflow-hidden', sizeClasses[size])}
            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
                <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
                <button onClick={onClose} className="btn-icon"><X className="w-4.5 h-4.5" /></button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Toggle ─────────────────────────────────────────────────────── */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5.5 rounded-full transition-colors duration-200',
          checked ? 'bg-brand-600' : 'bg-bg-border'
        )}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-md"
        />
      </div>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </label>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={clsx('skeleton', className)} style={{ minHeight: 16 }} />;
}

/* ─── Empty State ────────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon, title, description, action,
}: { icon?: React.ElementType; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-bg-secondary border border-bg-border flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-text-muted" />
        </div>
      )}
      <h3 className="font-display font-bold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── Platform Icon ──────────────────────────────────────────────── */
import { PLATFORMS } from '@/constants/platforms';
export function PlatformIcon({
  platformId, size = 28, showLabel = false,
}: { platformId: string; size?: number; showLabel?: boolean }) {
  const p = PLATFORMS[platformId];
  if (!p) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-lg flex items-center justify-center text-sm font-bold"
        style={{ width: size, height: size, background: p.bgColor, border: `1px solid ${p.color}44`, color: p.color, fontSize: size * 0.45 }}
      >
        {p.icon}
      </div>
      {showLabel && <span className="text-sm text-text-secondary font-medium">{p.name}</span>}
    </div>
  );
}

/* ─── Status Badge for posts ─────────────────────────────────────── */
export function PostStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    published: { label: 'Published',  variant: 'success'  },
    scheduled: { label: 'Scheduled',  variant: 'info'     },
    draft:     { label: 'Draft',      variant: 'default'  },
    failed:    { label: 'Failed',     variant: 'error'    },
    partial:   { label: 'Partial',    variant: 'warning'  },
    publishing:{ label: 'Publishing', variant: 'brand'    },
  };
  const m = map[status] ?? { label: status, variant: 'default' as BadgeVariant };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
