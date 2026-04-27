import { useState } from "react";
import { Pressable, Platform } from "react-native";
import { XStack, Text } from "tamagui";
import { Calendar } from "lucide-react-native";

const ACCENT = "#E08A38";
const TEXT = "#F5F0E8";
const TEXT_DIM = "rgba(245,240,232,0.6)";
const BORDER = "rgba(255,255,255,0.10)";

interface DateInputProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateInput({ value, onChange, placeholder }: DateInputProps) {
  if (Platform.OS === "web") {
    return (
      <XStack
        backgroundColor="rgba(255,255,255,0.06)"
        borderRadius="$3"
        borderWidth={1}
        borderColor={BORDER}
        height={52}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$2"
      >
        <Calendar size={18} color={ACCENT} />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: TEXT,
            fontSize: 16,
            fontFamily: "inherit",
            width: "100%",
            colorScheme: "dark",
          }}
        />
      </XStack>
    );
  }

  // Native fallback - plain text input
  return (
    <Pressable>
      <XStack
        backgroundColor="rgba(255,255,255,0.06)"
        borderRadius="$3"
        borderWidth={1}
        borderColor={BORDER}
        height={52}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$2"
      >
        <Calendar size={18} color={ACCENT} />
        <Text color={value ? TEXT : TEXT_DIM} fontSize="$3" flex={1}>
          {value || (placeholder ?? "Selecione a data")}
        </Text>
      </XStack>
    </Pressable>
  );
}
