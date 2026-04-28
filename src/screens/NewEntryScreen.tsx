import { EntryForm } from "@/components/entry/EntryForm";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { useEntries } from "@/hooks/useEntries";
import type { EntryInput } from "@/schemas/entry.schema";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text } from "tamagui";

export function NewEntryScreen() {
  const { create } = useEntries();
  const router = useRouter();

  const handleSubmit = async (data: EntryInput) => {
    try {
      await create(data);
      router.back();
    } catch (err: any) {
      alert(err.message ?? "Falha ao salvar");
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text color="$color" fontSize="$6" fontWeight="700" marginBottom="$4">
            Novo Registro ✍️
          </Text>
          <EntryForm onSubmit={handleSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
