import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Image, Video, Music, Hash, Clock, Send, ChevronDown,
  Smile, AlertCircle, CheckCircle2, Sliders, Calendar,
  Sparkles, Trash2, Plus, Eye,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { MOCK_ACCOUNTS } from '@/services/mockData';
import { MOCK_HASHTAG_SETS } from '@/services/mockData';
import { PLATFORMS } from '@/constants/platforms';
import { PlatformIcon, Toggle, Badge } from '@/components/ui';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { SocialAccount } from '@/types';

const CHAR_LIMITS: Record<string, number> = {
  instagram: 2200, facebook: 63206, twitter: 280,
  linkedin: 3000, threads: 500, youtube: 5000,
  sharechat: 500, moj: 300, pinterest: 500,
  telegram: 4096, whatsapp: 4096, snapchat: 250,
};

export function ComposerModal() {
  const { closeComposer } = useUIStore();
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['acc_01', 'acc_02', 'acc_03']);
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: string; name: string }[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<null | { platform: string; status: 'success' | 'failed' }[]>(null);
  const [showHashtagSets, setShowHashtagSets] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const connectedAccounts = MOCK_ACCOUNTS.filter(a => a.status === 'connected');
  const selectedAccountObjs = connectedAccounts.filter(a => selectedAccounts.includes(a.id));

  const fullText = text + (hashtags.length ? '\n\n' + hashtags.map(h => `#${h}`).join(' ') : '');
  const charCounts = selectedAccountObjs.map(acc => ({
    account: acc,
    limit: CHAR_LIMITS[acc.platform] ?? 2200,
    used: fullText.length,
    over: fullText.length > (CHAR_LIMITS[acc.platform] ?? 2200),
  }));
  const anyOver = charCounts.some(c => c.over);

  function toggleAccount(id: string) {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function addHashtag(tag: string) {
    const clean = tag.replace(/^#/, '').trim();
    if (clean && !hashtags.includes(clean)) setHashtags(prev => [...prev, clean]);
    setHashtagInput('');
  }

  function handleHashtagKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtag(hashtagInput);
    }
  }

  async function handlePublish() {
    if (!text.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content before posting.');
      return;
    }
    if (selectedAccounts.length === 0) {
      toast.error('Select at least one platform to post to.');
      return;
    }
    setPublishing(true);
    // Simulate API call with per-platform results
    await new Promise(r => setTimeout(r, 2200));
    const results = selectedAccountObjs.map(acc => ({
      platform: acc.platform,
      status: Math.random() > 0.15 ? 'success' : 'failed' as 'success' | 'failed',
    }));
    setPublishResults(results);
    setPublishing(false);
    const successes = results.filter(r => r.status === 'success').length;
    if (successes === results.length) {
      toast.success(`Published to ${successes} platform${successes > 1 ? 's' : ''}! 🎉`);
    } else if (successes > 0) {
      toast(`Published to ${successes}/${results.length} platforms`, { icon: '⚠️' });
    } else {
      toast.error('Publishing failed. Please try again.');
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      setMediaFiles(prev => [...prev, { url, type: f.type.startsWith('video') ? 'video' : 'image', name: f.name }]);
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={closeComposer}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full sm:max-w-3xl bg-bg-card border border-bg-border rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh]"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display text-lg font-bold text-text-primary">Create Post</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-bg-secondary rounded-xl p-1 border border-bg-border">
              {(['compose', 'preview'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                    activeTab === tab ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tab === 'preview' ? <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tab}</span> : tab}
                </button>
              ))}
            </div>
            <button onClick={closeComposer} className="btn-icon"><X className="w-4.5 h-4.5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'compose' ? (
            <div className="p-6 space-y-5">
              {/* Platform selector */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
                  Post to
                </label>
                <div className="flex flex-wrap gap-2">
                  {connectedAccounts.map(acc => {
                    const selected = selectedAccounts.includes(acc.id);
                    const p = PLATFORMS[acc.platform];
                    return (
                      <motion.button
                        key={acc.id}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => toggleAccount(acc.id)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                          selected
                            ? 'border-brand-600/50 bg-brand-600/10 text-text-primary'
                            : 'border-bg-border bg-bg-secondary text-text-muted hover:border-bg-border-light'
                        )}
                      >
                        <PlatformIcon platformId={acc.platform} size={20} />
                        <span>{acc.username}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Char limit warnings */}
                {anyOver && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {charCounts.filter(c => c.over).map(c => (
                      <span key={c.account.id} className="flex items-center gap-1 text-[11px] text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded-full border border-accent-rose/25">
                        <AlertCircle className="w-3 h-3" />
                        {PLATFORMS[c.account.platform]?.name}: {c.used}/{c.limit} chars
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Text composer */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="What's on your mind? Share your story, idea, or announcement..."
                  className="compose-textarea w-full"
                  rows={5}
                />
                {/* AI suggestion button */}
                <button className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-medium rounded-lg border border-brand-600/30 transition-all">
                  <Sparkles className="w-3 h-3" /> AI Suggest
                </button>
              </div>

              {/* Media previews */}
              {mediaFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {mediaFiles.map((f, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-bg-border group">
                      {f.type === 'image'
                        ? <img src={f.url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-bg-secondary flex items-center justify-center"><Video className="w-6 h-6 text-text-muted" /></div>
                      }
                      <button
                        onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-bg-border flex items-center justify-center text-text-muted hover:border-brand-600/40 hover:text-brand-400 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Hashtags</label>
                  <button
                    onClick={() => setShowHashtagSets(!showHashtagSets)}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <Hash className="w-3 h-3" /> Saved Sets
                  </button>
                </div>

                <AnimatePresence>
                  {showHashtagSets && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 p-3 bg-bg-secondary rounded-xl border border-bg-border">
                        {MOCK_HASHTAG_SETS.map(hs => (
                          <button
                            key={hs.id}
                            onClick={() => setHashtags(prev => [...new Set([...prev, ...hs.tags.map(t => t.replace('#', ''))])])}
                            className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand-600/40 transition-all"
                          >
                            {hs.name} <span className="text-text-muted">({hs.tags.length})</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {hashtags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs rounded-full">
                      #{tag}
                      <button onClick={() => setHashtags(prev => prev.filter(h => h !== tag))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKey}
                    placeholder="#hashtag (press Enter or Space to add)"
                    className="form-input text-sm py-2"
                  />
                  <button onClick={() => addHashtag(hashtagInput)} className="btn-secondary px-4 py-2 text-sm shrink-0">Add</button>
                </div>
              </div>

              {/* Char count indicator per selected platform */}
              {selectedAccountObjs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {charCounts.map(c => {
                    const pct = Math.min(100, (c.used / c.limit) * 100);
                    const color = c.over ? '#f43f5e' : pct > 80 ? '#f59e0b' : '#10b981';
                    return (
                      <div key={c.account.id} className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg border border-bg-border">
                        <PlatformIcon platformId={c.account.platform} size={18} />
                        <div className="flex-1 min-w-0">
                          <div className="h-1 bg-bg-border rounded-full overflow-hidden mb-1">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <span className="text-[10px] text-text-muted">{c.used}/{c.limit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Options row */}
              <div className="flex items-center gap-4 border-t border-bg-border pt-4">
                <Toggle checked={isScheduled} onChange={setIsScheduled} label="Schedule" />
                <Toggle checked={isCustomizing} onChange={setIsCustomizing} label="Customize per platform" />
              </div>

              {/* Schedule picker */}
              <AnimatePresence>
                {isScheduled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex gap-3">
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="form-input text-sm py-2" />
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="form-input text-sm py-2" />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">Timezone: IST (UTC +5:30)</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Per-platform customization */}
              <AnimatePresence>
                {isCustomizing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border border-bg-border rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-bg-secondary border-b border-bg-border flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-brand-400" />
                        <span className="text-sm font-semibold text-text-primary">Platform Customizations</span>
                      </div>
                      <div className="divide-y divide-bg-border">
                        {selectedAccountObjs.map(acc => (
                          <div key={acc.id} className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <PlatformIcon platformId={acc.platform} size={20} />
                              <span className="text-sm font-medium text-text-primary">{acc.displayName}</span>
                              <Badge variant="default">{acc.username}</Badge>
                            </div>
                            <textarea
                              placeholder={`Custom caption for ${PLATFORMS[acc.platform]?.name}...`}
                              defaultValue={text}
                              className="form-input text-sm resize-none"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Preview tab */
            <div className="p-6">
              <div className="max-w-sm mx-auto">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center text-lg">👤</div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Priya Sharma</p>
                      <p className="text-xs text-text-muted">Just now</p>
                    </div>
                  </div>
                  {mediaFiles[0] && (
                    <img src={mediaFiles[0].url} alt="" className="w-full aspect-square object-cover rounded-xl mb-3" />
                  )}
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{fullText || 'Your caption will appear here...'}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-bg-border text-text-muted">
                    <span className="flex items-center gap-1.5 text-xs">❤️ 0</span>
                    <span className="flex items-center gap-1.5 text-xs">💬 0</span>
                    <span className="flex items-center gap-1.5 text-xs">🔄 0</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted text-center mt-3">Preview on: Instagram Post</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Action bar */}
        <div className="px-6 py-4 border-t border-bg-border bg-bg-primary/50 shrink-0">
          {publishResults ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-primary mb-3">Publishing Results</p>
              <div className="flex flex-wrap gap-2">
                {publishResults.map(r => (
                  <div key={r.platform} className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium',
                    r.status === 'success' ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald' : 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose'
                  )}>
                    <PlatformIcon platformId={r.platform} size={16} />
                    {r.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {PLATFORMS[r.platform]?.name}
                  </div>
                ))}
              </div>
              <button onClick={closeComposer} className="btn-primary w-full mt-3">Done</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Media tools */}
              <div className="flex items-center gap-1">
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFilePick} />
                <button onClick={() => fileRef.current?.click()} className="btn-icon" title="Add image/video">
                  <Image className="w-4.5 h-4.5" />
                </button>
                <button className="btn-icon" title="Add video">
                  <Video className="w-4.5 h-4.5" />
                </button>
                <button className="btn-icon" title="Add emoji">
                  <Smile className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 text-xs text-text-muted">
                {selectedAccounts.length} platform{selectedAccounts.length !== 1 && 's'} selected
              </div>

              <button onClick={closeComposer} className="btn-secondary">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handlePublish}
                disabled={publishing || anyOver}
                className={clsx('btn-primary', (publishing || anyOver) && 'opacity-60 cursor-not-allowed')}
              >
                {publishing ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    Publishing...
                  </span>
                ) : isScheduled ? (
                  <><Clock className="w-4 h-4" /> Schedule Post</>
                ) : (
                  <><Send className="w-4 h-4" /> Post Now</>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
