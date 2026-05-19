import { ComposerModal } from '@/components/composer/ComposerModal';
import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';

export function ComposePage() {
  const { openComposer, closeComposer, composerOpen } = useUIStore();
  useEffect(() => { openComposer(); return () => closeComposer(); }, []);
  // Render inline composer area with background
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="glass-card p-8 text-center">
        <h2 className="font-display text-xl font-bold text-text-primary mb-2">Content Composer</h2>
        <p className="text-text-secondary text-sm">The composer dialog is open. Create and publish your post to all platforms.</p>
      </div>
    </div>
  );
}
