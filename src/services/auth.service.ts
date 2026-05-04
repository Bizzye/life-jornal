import { supabase } from '@/lib/supabase';
import type { LoginInput, RegisterInput } from '@/schemas/auth.schema';

export const authService = {
  async login({ email, password }: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async register({ email, password, name }: RegisterInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    // Se email confirmation está ativado, faz login automaticamente
    if (!data.session) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async updateProfile(data: { name: string; birthday?: string; avatar_url?: string }) {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        birthday: data.birthday ?? null,
        avatar_url: data.avatar_url ?? null,
      },
    });
    if (error) throw error;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    // Verify current password by re-authenticating
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email;
    if (!email) throw new Error('Sessão inválida');

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Senha atual incorreta');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
