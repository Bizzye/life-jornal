import { XStack, Text } from "tamagui";
import { Pressable } from "react-native";
import type { ReactNode } from "react";

interface ChipProps {
  label: string;
  color: string;
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, color, icon, selected, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress}>
      <XStack
        backgroundColor={selected ? color : "rgba(255,255,255,0.06)"}
        borderRadius="$6"
        paddingHorizontal="$3"
        paddingVertical="$1"
        borderWidth={1}
        borderColor={selected ? color : "rgba(255,255,255,0.10)"}
        alignItems="center"
        gap="$1.5"
      >
        {icon}
        <Text
          color={selected ? "#fff" : "$textSecondary"}
          fontSize="$2"
          fontWeight="500"
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
