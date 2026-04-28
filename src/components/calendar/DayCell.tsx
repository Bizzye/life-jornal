import { colors } from "@/theme/tokens";
import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "tamagui";

const DEFAULT_SIZE = 44;

interface DayCellProps {
  day: number;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasRegistros: boolean;
  count: number;
  onPress: (dateKey: string) => void;
  size?: number;
}

function ActivityRing({ count, size }: { count: number; size: number }) {
  if (count === 0) return null;

  const scale = size / DEFAULT_SIZE;
  const radius = 18 * scale;
  const stroke = 3 * scale;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = Math.min(count / 3, 1);
  const dashOffset = circumference * (1 - fillPercent);

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.accent}
        strokeOpacity={0.2}
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.accent}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

export const DayCell = memo(function DayCell({
  day,
  dateKey,
  isCurrentMonth,
  isToday,
  isSelected,
  hasRegistros,
  count,
  onPress,
  size = DEFAULT_SIZE,
}: DayCellProps) {
  const textColor = isToday
    ? colors.accent
    : isCurrentMonth
      ? colors.textPrimary
      : colors.textMuted;

  const fontSize = size > DEFAULT_SIZE ? 16 : 13;

  return (
    <Pressable
      onPress={() => onPress(dateKey)}
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size / 2,
        },
        isSelected && {
          backgroundColor: "rgba(224, 138, 56, 0.15)",
        },
      ]}
    >
      <ActivityRing count={count} size={size} />
      <Text
        color={textColor}
        fontSize={fontSize}
        fontWeight={isToday ? "800" : isSelected ? "700" : "400"}
        style={{ zIndex: 1 }}
      >
        {day}
      </Text>
    </Pressable>
  );
});
