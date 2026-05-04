import { colors } from '@/theme/tokens';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';

const DEFAULT_SIZE = 42;

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
  const isHighlighted = isSelected || isToday;

  return (
    <Pressable
      onPress={() => onPress(dateKey)}
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: size * 0.28 },
        isSelected && styles.selected,
        isToday && !isSelected && styles.today,
      ]}
    >
      <Text
        color={
          isSelected
            ? '#fff'
            : isToday
              ? colors.accent
              : isCurrentMonth
                ? colors.textPrimary
                : 'rgba(245,240,232,0.2)'
        }
        fontSize={14}
        fontWeight={isHighlighted ? '700' : '400'}
      >
        {day}
      </Text>
      {/* Activity dots */}
      {hasRegistros && (
        <View style={styles.dotRow}>
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : colors.accent,
                  opacity: isCurrentMonth ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  selected: {
    backgroundColor: colors.accent,
  },
  today: {
    backgroundColor: 'rgba(224,138,56,0.12)',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
