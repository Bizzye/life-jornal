import { YStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterInput } from "@/schemas/auth.schema";

export function RegisterScreen() {
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async (data: RegisterInput) => {
    try {
      await register(data);
      router.replace("/(tabs)");
    } catch (err: any) {
      alert(err.message ?? "Falha ao criar conta");
    }
  };

  return (
    <ScreenContainer justifyContent="center">
      <Text
        color="$accent"
        fontSize="$8"
        fontWeight="800"
        textAlign="center"
        marginBottom="$2"
      >
        Criar Conta
      </Text>
      <Text
        color="$textSecondary"
        fontSize="$3"
        textAlign="center"
        marginBottom="$6"
      >
        Comece a registrar sua vida
      </Text>

      <RegisterForm onSubmit={handleRegister} loading={loading} />

      <Button variant="ghost" onPress={() => router.back()} marginTop="$4">
        Já tem conta? Entrar
      </Button>
    </ScreenContainer>
  );
}
