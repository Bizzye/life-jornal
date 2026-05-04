import { RegistroForm } from '@/components/entry/RegistroForm';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useEntries } from '@/hooks/useEntries';
import { friendlyError } from '@/lib/errorMessages';
import type { EntryInput } from '@/schemas/entry.schema';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'tamagui';

export function NewEntryScreen() {
  const { create } = useEntries();
  const router = useRouter();

  const handleSubmit = async (data: EntryInput) => {
    try {
      await create(data);
      router.back();
    } catch (err) {
      toast.error(friendlyError(err, 'Falha ao salvar'));
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text color="$color" fontSize="$6" fontWeight="700" marginBottom="$4">
            Novo Registro ✍️
          </Text>
          <RegistroForm onSubmit={handleSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
