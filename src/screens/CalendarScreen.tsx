import { YStack, Text } from "tamagui";
import { ScreenContainer } from "@/components/layout/ScreenContainer";

export function CalendarScreen() {
  return (
    <ScreenContainer justifyContent="center" alignItems="center">
      <Text color="$color" fontSize="$6" fontWeight="700">
        📅 Calendário
      </Text>
      <Text color="$textSecondary" fontSize="$3" marginTop="$2">
        Em breve — visualização por dia/mês/semestre
      </Text>
    </ScreenContainer>
  );
}
