import { RegisterForm } from '@/components/auth/RegisterForm';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { friendlyError } from '@/lib/errorMessages';
import type { RegisterInput } from '@/schemas/auth.schema';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { Text } from 'tamagui';

export function RegisterScreen() {
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async (data: RegisterInput) => {
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch (err) {
      toast.error(friendlyError(err, 'Falha ao criar conta'));
    }
  };

  return (
    <ScreenContainer justifyContent="center">
      <Text color="$accent" fontSize="$8" fontWeight="800" textAlign="center" marginBottom="$2">
        Criar Conta
      </Text>
      <Text color="$textSecondary" fontSize="$3" textAlign="center" marginBottom="$6">
        Comece a registrar sua vida
      </Text>

      <RegisterForm onSubmit={handleRegister} loading={loading} />

      <Button variant="ghost" onPress={() => router.back()} marginTop="$4">
        Já tem conta? Entrar
      </Button>
    </ScreenContainer>
  );
}
