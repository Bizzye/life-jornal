import { FlatList } from "react-native";
import { YStack, Text } from "tamagui";
import { RegistroCard } from "./RegistroCard";
import type { Registro } from "@/types";

interface RegistroListProps {
  registros: Registro[];
  onPressRegistro?: (registro: Registro) => void;
}

export function RegistroList({
  registros,
  onPressRegistro,
}: RegistroListProps) {
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
        <RegistroCard registro={item} onPress={() => onPressRegistro?.(item)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
