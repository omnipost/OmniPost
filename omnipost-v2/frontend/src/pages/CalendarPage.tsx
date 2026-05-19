/* ================================================================
   CalendarPage
   ================================================================ */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Card, PlatformIcon, PostStatusBadge } from '@/components/ui';
import { MOCK_POSTS } from '@/services/mockData';
import { useUIStore } from '@/store/uiStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { clsx } from 'clsx';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { openComposer } = useUIStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day: Date) =>
    MOCK_POSTS.filter(p => {
      const d = p.scheduledAt ?? p.publishedAt;
      return d && isSameDay(new Date(d), day);
    });

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-icon"><ChevronLeft className="w-4.5 h-4.5"/></button>
          <h2 className="font-display text-xl font-bold text-text-primary">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-icon"><ChevronRight className="w-4.5 h-4.5"/></button>
        </div>
        <button onClick={openComposer} className="btn-primary"><Plus className="w-4 h-4"/> Schedule Post</button>
      </div>

      <Card className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-text-muted py-2">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading blanks */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`b${i}`}/>)}
          {days.map(day => {
            const posts = getPostsForDay(day);
            return (
              <motion.div
                key={day.toISOString()}
                whileHover={{ scale: 1.02 }}
                className={clsx(
                  'min-h-[80px] p-2 rounded-xl border cursor-pointer transition-all',
                  isToday(day) ? 'border-brand-600/50 bg-brand-600/5' : 'border-bg-border hover:bg-bg-hover',
                  !isSameMonth(day, currentMonth) && 'opacity-30'
                )}
              >
                <span className={clsx('text-xs font-bold', isToday(day) ? 'text-brand-400' : 'text-text-secondary')}>{format(day, 'd')}</span>
                <div className="mt-1 space-y-0.5">
                  {posts.slice(0, 2).map(p => (
                    <div key={p.id} className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium truncate', p.status === 'scheduled' ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-accent-emerald/15 text-accent-emerald')}>
                      {p.status === 'scheduled' ? '🕐' : '✓'} {p.text.slice(0, 12)}…
                    </div>
                  ))}
                  {posts.length > 2 && <div className="text-[10px] text-text-muted">+{posts.length - 2} more</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Scheduled posts list */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-cyan"/> Upcoming Scheduled Posts
        </h3>
        <div className="space-y-3">
          {MOCK_POSTS.filter(p => p.status === 'scheduled').map(p => (
            <div key={p.id} className="flex gap-4 p-4 bg-bg-secondary rounded-xl border border-bg-border hover:border-bg-border-light transition-colors">
              <div className="w-12 h-14 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-accent-cyan uppercase">{p.scheduledAt && format(new Date(p.scheduledAt), 'MMM')}</span>
                <span className="text-xl font-display font-bold text-accent-cyan leading-none">{p.scheduledAt && format(new Date(p.scheduledAt), 'd')}</span>
                <span className="text-[9px] text-accent-cyan/70">{p.scheduledAt && format(new Date(p.scheduledAt), 'HH:mm')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary line-clamp-2 leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  {p.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={20}/>)}
                  <PostStatusBadge status={p.status}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
