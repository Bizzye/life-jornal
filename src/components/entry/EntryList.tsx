import type { Registro } from "@/types";
import { FlatList } from "react-native";
import { Text, YStack } from "tamagui";
import { EntryCard } from "./EntryCard";

interface EntryListProps {
  registros: Registro[];
  onPressRegistro?: (registro: Registro) => void;
}

export function EntryList({ registros, onPressRegistro }: EntryListProps) {
  if (registros.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
        <Text color="$textSecondary" fontSize="$4">
          Nenhum registro ainda 📝
        </Text>
        <Text color="$textMuted" fontSize="$2" marginTop="$2">
          Toque em + para criar seu primeiro registro
        </Text>
      </YStack>
    );
  }

  return (
    <FlatList
      data={registros}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EntryCard registro={item} onPress={() => onPressRegistro?.(item)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
