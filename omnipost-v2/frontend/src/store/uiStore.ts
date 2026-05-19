import { create } from 'zustand';

interface UIState {
  sidebarOpen:     boolean;
  composerOpen:    boolean;
  activeModal:     string | null;
  notifications:   number;

  toggleSidebar:   () => void;
  setSidebar:      (v: boolean) => void;
  openComposer:    () => void;
  closeComposer:   () => void;
  openModal:       (id: string) => void;
  closeModal:      () => void;
  setNotifications:(n: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen:   true,
  composerOpen:  false,
  activeModal:   null,
  notifications: 3,

  toggleSidebar:    () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar:       (v) => set({ sidebarOpen: v }),
  openComposer:     () => set({ composerOpen: true }),
  closeComposer:    () => set({ composerOpen: false }),
  openModal:        (id) => set({ activeModal: id }),
  closeModal:       () => set({ activeModal: null }),
  setNotifications: (n) => set({ notifications: n }),
}));
