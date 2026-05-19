import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { useUIStore } from '@/store/uiStore';

export function AppLayout() {
  const { composerOpen } = useUIStore();

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Background ambient glow */}
      <div className="page-glow pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
        <Header />

        <main className="flex-1 p-6 mt-16 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Global Composer Modal */}
      <AnimatePresence>
        {composerOpen && <ComposerModal />}
      </AnimatePresence>
    </div>
  );
}
