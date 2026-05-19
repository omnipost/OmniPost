// src/store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  composerVisible: boolean;
  activeModal:     string | null;

  openComposer:  () => void;
  closeComposer: () => void;
  openModal:     (id: string) => void;
  closeModal:    () => void;
}

export const useUIStore = create<UIState>((set) => ({
  composerVisible: false,
  activeModal:     null,

  openComposer:  () => set({ composerVisible: true }),
  closeComposer: () => set({ composerVisible: false }),
  openModal:     (id) => set({ activeModal: id }),
  closeModal:    () => set({ activeModal: null }),
}));
