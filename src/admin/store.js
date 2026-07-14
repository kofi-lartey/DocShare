import { create } from 'zustand';

// Lightweight admin UI store (kept separate from AuthContext which owns the
// consumer session). Holds cross-page admin UI state only.
export const useAdminStore = create((set) => ({
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),

  range: '30d',
  setRange: (range) => set({ range }),
}));
