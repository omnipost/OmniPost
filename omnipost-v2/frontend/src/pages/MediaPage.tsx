import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, Image, Video, Music, Trash2, Download, Grid3X3, List } from 'lucide-react';
import { Card, EmptyState, Badge } from '@/components/ui';
import { MOCK_MEDIA } from '@/services/mockData';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { MediaAsset } from '@/types';

export function MediaPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = MOCK_MEDIA.filter(m =>
    (filter === 'all' || m.type === filter) &&
    (!search || m.filename.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSizeMb = MOCK_MEDIA.reduce((s, m) => s + m.size, 0) / 1_000_000;

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Media Library</h2>
          <p className="text-sm text-text-secondary mt-0.5">{MOCK_MEDIA.length} assets · {totalSizeMb.toFixed(0)} MB used of 5 GB</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={() => { setSelected([]); toast.success(`${selected.length} items deleted`); }} className="btn-secondary text-accent-rose border-accent-rose/30 text-sm py-2">
              <Trash2 className="w-4 h-4"/> Delete ({selected.length})
            </button>
          )}
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden"
            onChange={e => {
              const count = e.target.files?.length ?? 0;
              toast.success(`Uploading ${count} file${count > 1 ? 's' : ''}...`);
            }}
          />
          <button onClick={() => fileRef.current?.click()} className="btn-primary text-sm py-2">
            <Upload className="w-4 h-4"/> Upload
          </button>
        </div>
      </div>

      {/* Storage bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Storage used</span>
          <span>{totalSizeMb.toFixed(0)} MB / 5,120 MB</span>
        </div>
        <div className="h-2 bg-bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalSizeMb / 5120) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-brand rounded-full"
          />
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="form-input pl-9 py-2 text-sm"/>
        </div>
        <div className="flex bg-bg-secondary border border-bg-border rounded-xl p-1 gap-1">
          {(['all','image','video','audio'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-brand-600 text-white' : 'text-text-muted hover:text-text-primary')}
            >{f}</button>
          ))}
        </div>
        <div className="flex bg-bg-secondary border border-bg-border rounded-xl p-1">
          <button onClick={() => setView('grid')} className={clsx('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-bg-card text-text-primary' : 'text-text-muted')}>
            <Grid3X3 className="w-4 h-4"/>
          </button>
          <button onClick={() => setView('list')} className={clsx('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-bg-card text-text-primary' : 'text-text-muted')}>
            <List className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Upload drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-bg-border rounded-2xl p-8 text-center cursor-pointer hover:border-brand-600/40 hover:bg-brand-600/5 transition-all group"
      >
        <Upload className="w-8 h-8 text-text-muted group-hover:text-brand-400 mx-auto mb-3 transition-colors"/>
        <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Drop files here or click to upload</p>
        <p className="text-xs text-text-muted mt-1">Images, videos, audio — up to 500 MB per file</p>
      </div>

      {/* Media grid / list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Image} title="No media found" description="Upload your first image, video or audio file."/>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggleSelect(asset.id)}
              className={clsx(
                'relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group',
                selected.includes(asset.id) ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent hover:border-bg-border-light'
              )}
            >
              <img src={asset.thumbUrl ?? asset.url} alt={asset.filename} className="w-full h-full object-cover"/>
              {asset.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white"/>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-2 opacity-0 group-hover:opacity-100">
                <p className="text-[10px] text-white font-medium truncate">{asset.filename}</p>
              </div>
              {selected.includes(asset.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-xs text-text-muted">
                <th className="p-4 text-left font-semibold">File</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Size</th>
                <th className="p-4 text-left font-semibold">Uploaded</th>
                <th className="p-4"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/50">
              {filtered.map(asset => (
                <tr key={asset.id} className="hover:bg-bg-hover/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={asset.thumbUrl ?? asset.url} alt="" className="w-10 h-10 rounded-lg object-cover"/>
                      <span className="text-text-primary font-medium truncate max-w-[150px]">{asset.filename}</span>
                    </div>
                  </td>
                  <td className="p-4"><Badge variant={asset.type === 'image' ? 'brand' : 'info'}>{asset.type}</Badge></td>
                  <td className="p-4 text-text-secondary">{(asset.size / 1_000_000).toFixed(1)} MB</td>
                  <td className="p-4 text-text-secondary">{formatDistanceToNow(new Date(asset.uploadedAt), { addSuffix: true })}</td>
                  <td className="p-4">
                    <button className="btn-icon" onClick={() => toast.success('Downloading...')}><Download className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
