import { EntryCard } from "@/components/entry/EntryCard";
import { colors } from "@/theme/tokens";
import type { Registro } from "@/types";
import React from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { Text, YStack } from "tamagui";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DayDetailListProps {
  date: string | null;
  registros: Registro[];
}

function formatSelectedDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function DayDetailList({ date, registros }: DayDetailListProps) {
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [date]);

  if (!date) return null;

  return (
    <YStack marginTop="$4" gap="$2">
      <Text
        color={colors.accent}
        fontSize={15}
        fontWeight="700"
        textTransform="capitalize"
      >
        {formatSelectedDate(date)}
      </Text>

      {registros.length === 0 ? (
        <YStack
          backgroundColor="rgba(255,255,255,0.04)"
          borderRadius="$4"
          padding="$4"
          alignItems="center"
        >
          <Text color={colors.textMuted} fontSize={14}>
            Nenhum registro neste dia
          </Text>
        </YStack>
      ) : (
        registros.map((r) => <EntryCard key={r.id} registro={r} />)
      )}
    </YStack>
  );
}
