import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Eye, Heart, Plus, ArrowRight,
  CheckCircle2, AlertTriangle, Clock, Zap, Calendar,
  BarChart3, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { StatCard, Card, Badge, PostStatusBadge, PlatformIcon, EmptyState } from '@/components/ui';
import { MOCK_ACCOUNTS, MOCK_ANALYTICS, MOCK_POSTS } from '@/services/mockData';
import { PLATFORMS } from '@/constants/platforms';
import { clsx } from 'clsx';
import { formatDistanceToNow, format } from 'date-fns';

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } },
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { openComposer } = useUIStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Creator';
  const chartData = MOCK_ANALYTICS.dailyData.slice(-14).map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    impressions: d.impressions,
    engagement: d.engagement,
    reach: d.reach,
  }));

  const connectedCount  = MOCK_ACCOUNTS.filter(a => a.status === 'connected').length;
  const expiredCount    = MOCK_ACCOUNTS.filter(a => a.status === 'expired').length;
  const scheduledPosts  = MOCK_POSTS.filter(p => p.status === 'scheduled').length;
  const publishedPosts  = MOCK_POSTS.filter(p => p.status === 'published').length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">

      {/* ── Hero welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute right-0 top-0 w-64 h-64 opacity-5" style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
        }} />

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Good morning, {firstName}! ✨
            </h2>
            <p className="text-text-secondary mt-1 text-sm">
              You have <span className="text-text-primary font-semibold">{scheduledPosts} post{scheduledPosts !== 1 && 's'} scheduled</span> and{' '}
              <span className="text-text-primary font-semibold">{connectedCount} platforms connected</span>.
              {expiredCount > 0 && (
                <span className="text-accent-amber"> {expiredCount} token{expiredCount !== 1 && 's'} need reconnecting.</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/analytics" className="btn-secondary hidden sm:flex">
              <BarChart3 className="w-4 h-4" /> View Analytics
            </Link>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={openComposer}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Create Post
            </motion.button>
          </div>
        </div>

        {/* Quick platform status */}
        <div className="flex flex-wrap gap-2 mt-5">
          {MOCK_ACCOUNTS.map(acc => (
            <div
              key={acc.id}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                acc.status === 'connected'
                  ? 'bg-bg-secondary border-bg-border text-text-secondary'
                  : 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber'
              )}
            >
              <PlatformIcon platformId={acc.platform} size={18} />
              <span>{acc.username}</span>
              {acc.status === 'expired' && <AlertTriangle className="w-3 h-3" />}
              {acc.status === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />}
            </div>
          ))}
          <Link
            to="/settings/accounts"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-bg-border text-xs text-text-muted hover:text-brand-400 hover:border-brand-600/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Platform
          </Link>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={stagger.container} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Impressions', value: MOCK_ANALYTICS.totalImpressions, delta: 18, icon: Eye,        color: '#6366f1' },
          { label: 'Total Reach',       value: MOCK_ANALYTICS.totalReach,       delta: 12, icon: Users,      color: '#22d3ee' },
          { label: 'Engagement',        value: MOCK_ANALYTICS.totalEngagement,  delta: 24, icon: Heart,      color: '#f43f5e' },
          { label: 'Avg. Eng. Rate',    value: `${MOCK_ANALYTICS.avgEngagementRate}%`, delta: 3, icon: TrendingUp, color: '#10b981', suffix: '' },
        ].map((s, i) => (
          <motion.div key={s.label} variants={stagger.item}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Chart + Platforms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-title text-base">Performance Overview</h3>
                <p className="text-xs text-text-muted mt-0.5">Last 14 days · All platforms</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-3 h-1.5 rounded-full bg-brand-400 inline-block" />Impressions</span>
                <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-3 h-1.5 rounded-full bg-accent-cyan inline-block" />Engagement</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,71,0.5)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip
                  contentStyle={{ background: '#0E1829', border: '1px solid #1E2D47', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => [v.toLocaleString('en-IN'), '']}
                />
                <Area type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={2} fill="url(#gImpressions)" />
                <Area type="monotone" dataKey="engagement"  stroke="#22d3ee" strokeWidth={2} fill="url(#gEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Platform breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 h-full">
            <h3 className="section-title text-base mb-4">Platform Reach</h3>
            <div className="space-y-3">
              {MOCK_ANALYTICS.platforms.map(p => {
                const total = MOCK_ANALYTICS.totalReach;
                const pct = Math.round((p.reach / total) * 100);
                return (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platformId={p.platform} size={22} />
                        <span className="text-xs font-medium text-text-secondary capitalize">{PLATFORMS[p.platform]?.name}</span>
                      </div>
                      <span className="text-xs text-text-muted">{p.reach.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: PLATFORMS[p.platform]?.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Recent Posts + Scheduled ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent posts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base">Recent Posts</h3>
            <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_POSTS.filter(p => p.status === 'published').slice(0, 3).map(post => (
              <div key={post.id} className="flex gap-3 p-3 bg-bg-secondary rounded-xl border border-bg-border hover:border-bg-border-light transition-colors">
                {post.media[0] && (
                  <img src={post.media[0].thumbUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{post.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {post.targets.map(t => (
                      <PlatformIcon key={t.id} platformId={t.platform} size={18} />
                    ))}
                    <span className="ml-auto text-[11px] text-text-muted">
                      {post.publishedAt && formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Scheduled */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base">Upcoming Scheduled</h3>
            <Link to="/calendar" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Calendar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {MOCK_POSTS.filter(p => p.status === 'scheduled').length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No scheduled posts"
              description="Schedule your next post to stay consistent."
              action={<button onClick={openComposer} className="btn-primary text-xs py-2">Schedule a post</button>}
            />
          ) : (
            <div className="space-y-3">
              {MOCK_POSTS.filter(p => p.status === 'scheduled').map(post => (
                <div key={post.id} className="flex gap-3 p-3 bg-bg-secondary rounded-xl border border-bg-border hover:border-bg-border-light transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-accent-cyan uppercase">
                      {post.scheduledAt && format(new Date(post.scheduledAt), 'MMM')}
                    </span>
                    <span className="text-lg font-display font-bold text-accent-cyan leading-none">
                      {post.scheduledAt && format(new Date(post.scheduledAt), 'd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{post.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {post.targets.map(t => (
                        <PlatformIcon key={t.id} platformId={t.platform} size={18} />
                      ))}
                      <span className="ml-auto text-[11px] text-accent-cyan font-medium">
                        {post.scheduledAt && format(new Date(post.scheduledAt), 'hh:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Top Hashtags ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-base">Top Performing Hashtags</h3>
          <Badge variant="info">Last 30 days</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_ANALYTICS.topHashtags.map((ht, i) => (
            <motion.div
              key={ht.tag} initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-bg-border rounded-xl hover:border-brand-600/40 transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium text-text-primary">{ht.tag}</span>
              <span className="text-xs text-text-muted">{(ht.reach / 1000).toFixed(0)}k reach</span>
            </motion.div>
          ))}
        </div>
      </Card>

    </div>
  );
}
