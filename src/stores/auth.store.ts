import { create } from "zustand";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
  session: { access_token: string } | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setSession: (session: { access_token: string } | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, session: null, loading: false }),
}));
