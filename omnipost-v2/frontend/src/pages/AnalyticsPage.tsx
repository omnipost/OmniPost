import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Eye, Heart, Users, Share2,
  Download, Calendar, ChevronDown, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { StatCard, Card, Badge, PlatformIcon } from '@/components/ui';
import { MOCK_ANALYTICS } from '@/services/mockData';
import { PLATFORMS } from '@/constants/platforms';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const RANGES = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days'];
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f43f5e', '#10b981', '#f59e0b', '#a855f7'];

export function AnalyticsPage() {
  const [range, setRange] = useState('Last 30 days');

  const chartData = MOCK_ANALYTICS.dailyData.slice(-30).map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    Impressions: d.impressions,
    Reach: d.reach,
    Engagement: d.engagement,
    Posts: d.posts,
  }));

  const pieData = MOCK_ANALYTICS.platforms.map(p => ({
    name: PLATFORMS[p.platform]?.name ?? p.platform,
    value: p.reach,
    platform: p.platform,
  }));

  const engData = MOCK_ANALYTICS.platforms.map(p => ({
    name: PLATFORMS[p.platform]?.name ?? p.platform,
    rate: p.engagementRate,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
  }));

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Analytics</h2>
          <p className="text-sm text-text-secondary mt-0.5">All platforms · {range}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Range selector */}
          <div className="relative">
            <select
              value={range}
              onChange={e => setRange(e.target.value)}
              className="form-input py-2 pr-8 text-sm appearance-none cursor-pointer"
            >
              {RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
          <button
            onClick={() => toast.success('Report exported!')}
            className="btn-secondary text-sm py-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: MOCK_ANALYTICS.totalImpressions,       delta: 18,  icon: Eye,        color: '#6366f1' },
          { label: 'Total Reach',       value: MOCK_ANALYTICS.totalReach,             delta: 12,  icon: Users,      color: '#22d3ee' },
          { label: 'Total Engagement',  value: MOCK_ANALYTICS.totalEngagement,        delta: 24,  icon: Heart,      color: '#f43f5e' },
          { label: 'Avg Eng. Rate',     value: MOCK_ANALYTICS.avgEngagementRate + '%',delta: 3,   icon: TrendingUp, color: '#10b981' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-text-primary">Impressions & Reach Over Time</h3>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-brand-400 inline-block"/>Impressions</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-accent-cyan inline-block"/>Reach</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,71,0.5)"/>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={{ background: '#0E1829', border: '1px solid #1E2D47', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} formatter={(v: number) => [v.toLocaleString('en-IN'), '']}/>
              <Area type="monotone" dataKey="Impressions" stroke="#6366f1" strokeWidth={2} fill="url(#gI)"/>
              <Area type="monotone" dataKey="Reach"       stroke="#22d3ee" strokeWidth={2} fill="url(#gR)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card className="p-5">
          <h3 className="font-display font-bold text-text-primary mb-4">Reach by Platform</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PLATFORMS[_.platform]?.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0E1829', border: '1px solid #1E2D47', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [v.toLocaleString('en-IN'), 'Reach']}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORMS[p.platform]?.color ?? PIE_COLORS[i] }}/>
                  <span className="text-text-secondary">{p.name}</span>
                </span>
                <span className="text-text-primary font-medium">{(p.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Engagement by platform */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-5">Engagement by Platform</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,71,0.5)"/>
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#0E1829', border: '1px solid #1E2D47', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} formatter={(v: number) => [v.toLocaleString('en-IN'), '']}/>
            <Bar dataKey="likes"    stackId="a" fill="#6366f1" radius={[0,0,4,4]}/>
            <Bar dataKey="comments" stackId="a" fill="#22d3ee"/>
            <Bar dataKey="shares"   stackId="a" fill="#10b981" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Per-platform table */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-4">Platform Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted border-b border-bg-border">
                {['Platform','Followers','Impressions','Reach','Likes','Comments','Shares','Eng. Rate','Growth'].map(h => (
                  <th key={h} className="pb-3 pr-4 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/50">
              {MOCK_ANALYTICS.platforms.map(p => (
                <tr key={p.platform} className="hover:bg-bg-hover/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platformId={p.platform} size={24}/>
                      <span className="font-medium text-text-primary capitalize">{PLATFORMS[p.platform]?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{(p.reach * 2).toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.impressions.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.reach.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.likes.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.comments.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.shares.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-semibold ${p.engagementRate >= 7 ? 'text-accent-emerald' : p.engagementRate >= 5 ? 'text-accent-amber' : 'text-text-secondary'}`}>
                      {p.engagementRate}%
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-accent-emerald font-medium">+{p.followersGrowth.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top hashtags + best times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent-amber"/> Top Hashtags
          </h3>
          <div className="space-y-3">
            {MOCK_ANALYTICS.topHashtags.map((ht, i) => (
              <div key={ht.tag} className="flex items-center gap-3">
                <span className="w-5 text-xs text-text-muted font-mono text-right">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-text-primary">{ht.tag}</span>
                <span className="text-xs text-text-muted">{ht.count} posts</span>
                <Badge variant="info">{(ht.reach / 1000).toFixed(0)}k</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-cyan"/> Best Times to Post
          </h3>
          <div className="space-y-3">
            {MOCK_ANALYTICS.bestPostTime.map(bt => (
              <div key={bt.platform} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-bg-border">
                <PlatformIcon platformId={bt.platform} size={28}/>
                <div>
                  <p className="text-sm font-medium text-text-primary">{PLATFORMS[bt.platform]?.name}</p>
                  <p className="text-xs text-text-muted">{bt.day} at {bt.hour}:00</p>
                </div>
                <Badge variant="success" className="ml-auto">Optimal</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
