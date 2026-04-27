import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";

/**
 * Inicializa a sessão uma única vez no root layout.
 * NÃO usar em telas individuais.
 */
export function useAuthInit() {
  const { setUser, setSession, setLoading, reset } = useAuthStore();

  useEffect(() => {
    authService.getSession().then((s) => {
      if (s) {
        setSession({ access_token: s.access_token });
        setUser({
          id: s.user.id,
          email: s.user.email!,
          name: s.user.user_metadata?.name ?? "",
        });
      }
      setLoading(false);
    });

    const { data: listener } = authService.onAuthStateChange((_event, s) => {
      if (s) {
        setSession({ access_token: s.access_token });
        setUser({
          id: s.user.id,
          email: s.user.email!,
          name: s.user.user_metadata?.name ?? "",
        });
      } else {
        reset();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);
}

export function useAuth() {
  const { user, session, loading, setLoading, reset } = useAuthStore();

  const login = async (input: LoginInput) => {
    setLoading(true);
    try {
      await authService.login(input);
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setLoading(true);
    try {
      await authService.register(input);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    reset();
  };

  return { user, session, loading, login, register, logout };
}
