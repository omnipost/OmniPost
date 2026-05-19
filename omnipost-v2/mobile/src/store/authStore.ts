// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { User } from '../types';

// MMKV storage adapter for Zustand
const storage = new MMKV({ id: 'omnipost-auth' });
const mmkvStorage = {
  getItem:    (key: string) => storage.getString(key) ?? null,
  setItem:    (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;

  setAuth:    (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout:     () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name:    'omnipost-auth',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
