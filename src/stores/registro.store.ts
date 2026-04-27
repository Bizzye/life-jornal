import { create } from "zustand";
import type { Registro } from "@/types";

interface RegistroState {
  registros: Registro[];
  loading: boolean;
  setRegistros: (registros: Registro[]) => void;
  addRegistro: (registro: Registro) => void;
  updateRegistro: (id: string, data: Partial<Registro>) => void;
  removeRegistro: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useRegistroStore = create<RegistroState>((set) => ({
  registros: [],
  loading: false,
  setRegistros: (registros) => set({ registros }),
  addRegistro: (registro) =>
    set((s) => ({ registros: [registro, ...s.registros] })),
  updateRegistro: (id, data) =>
    set((s) => ({
      registros: s.registros.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  removeRegistro: (id) =>
    set((s) => ({ registros: s.registros.filter((e) => e.id !== id) })),
  setLoading: (loading) => set({ loading }),
}));
