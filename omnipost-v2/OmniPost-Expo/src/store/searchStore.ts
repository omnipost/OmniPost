import { create } from 'zustand';

interface SearchState {
  queries: Record<string, string>;
  setQuery: (page: string, query: string) => void;
  clearQuery: (page: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  queries: {},
  setQuery: (page, query) =>
    set((state) => ({
      queries: { ...state.queries, [page]: query },
    })),
  clearQuery: (page) =>
    set((state) => ({
      queries: { ...state.queries, [page]: '' },
    })),
}));
