import { useRouter } from "expo-router";
import { Text, YStack } from "tamagui";
import { ScrollView } from "react-native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { RegistroForm } from "@/components/registro/RegistroForm";
import { useRegistros } from "@/hooks/useRegistros";
import type { RegistroInput } from "@/schemas/registro.schema";

export function NovoRegistroScreen() {
  const { create } = useRegistros();
  const router = useRouter();

  const handleSubmit = async (data: RegistroInput) => {
    try {
      await create(data);
      router.back();
    } catch (err: any) {
      alert(err.message ?? "Falha ao salvar");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text color="$color" fontSize="$6" fontWeight="700" marginBottom="$4">
          Novo Registro ✍️
        </Text>
        <RegistroForm onSubmit={handleSubmit} />
      </ScrollView>
    </ScreenContainer>
  );
}
