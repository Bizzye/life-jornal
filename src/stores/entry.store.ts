import type { Registro } from "@/types";
import { create } from "zustand";

interface EntryState {
  entries: Registro[];
  loading: boolean;
  setEntries: (entries: Registro[]) => void;
  addEntry: (entry: Registro) => void;
  updateEntry: (id: string, data: Partial<Registro>) => void;
  removeEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  loading: false,
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  updateEntry: (id, data) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  removeEntry: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
  setLoading: (loading) => set({ loading }),
}));
