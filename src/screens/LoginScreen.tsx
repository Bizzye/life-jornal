import { LoginForm } from '@/components/auth/LoginForm';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { friendlyError } from '@/lib/errorMessages';
import type { LoginInput } from '@/schemas/auth.schema';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { Text } from 'tamagui';

export function LoginScreen() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (data: LoginInput) => {
    try {
      await login(data);
      router.replace('/(tabs)');
    } catch (err) {
      toast.error(friendlyError(err, 'Falha ao entrar'));
    }
  };

  return (
    <ScreenContainer justifyContent="center">
      <Text color="$accent" fontSize="$8" fontWeight="800" textAlign="center" marginBottom="$2">
        Life Journal
      </Text>
      <Text color="$textSecondary" fontSize="$3" textAlign="center" marginBottom="$6">
        Seu diário pessoal
      </Text>

      <LoginForm onSubmit={handleLogin} loading={loading} />

      <Button variant="ghost" onPress={() => router.push('/(auth)/register')} marginTop="$4">
        Não tem conta? Cadastre-se
      </Button>
    </ScreenContainer>
  );
}
