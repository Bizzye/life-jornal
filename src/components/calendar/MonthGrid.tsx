import type { DaySummary } from '@/hooks/useCalendarEntries';
import { colors } from '@/theme/tokens';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, XStack } from 'tamagui';
import { DayCell } from './DayCell';

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const WEEKEND = new Set([5, 6]); // Sáb, Dom (0-indexed in WEEKDAYS)

interface MonthGridProps {
  currentMonth: Date;
  daySummaries: Map<string, DaySummary>;
  selectedDate: string | null;
  onDayPress: (dateKey: string) => void;
}

function getDaysForMonth(month: Date) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  // Monday = 0 ... Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, m, 0).getDate();

  const today = new Date();
  const todayKey = today.getFullYear() === year && today.getMonth() === m ? today.getDate() : -1;

  const cells: {
    day: number;
    dateKey: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = new Date(year, m - 1, d);
    cells.push({
      day: d,
      dateKey: toDateKey(prevMonth),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateKey: toDateKey(new Date(year, m, d)),
      isCurrentMonth: true,
      isToday: d === todayKey,
    });
  }

  // Next month leading days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = new Date(year, m + 1, d);
      cells.push({
        day: d,
        dateKey: toDateKey(nextMonth),
        isCurrentMonth: false,
        isToday: false,
      });
    }
  }

  return cells;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function MonthGrid({
  currentMonth,
  daySummaries,
  selectedDate,
  onDayPress,
}: MonthGridProps) {
  const cells = useMemo(() => getDaysForMonth(currentMonth), [currentMonth]);

  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <XStack justifyContent="space-around" marginBottom="$2" paddingHorizontal={2}>
        {WEEKDAYS.map((label, i) => (
          <Text
            key={i}
            color={WEEKEND.has(i) ? 'rgba(245,240,232,0.25)' : colors.textMuted}
            fontSize={12}
            fontWeight="600"
            width={42}
            textAlign="center"
          >
            {label}
          </Text>
        ))}
      </XStack>

      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell) => {
            const summary = daySummaries.get(cell.dateKey);
            return (
              <DayCell
                key={cell.dateKey}
                day={cell.day}
                dateKey={cell.dateKey}
                isCurrentMonth={cell.isCurrentMonth}
                isToday={cell.isToday}
                isSelected={selectedDate === cell.dateKey}
                hasRegistros={(summary?.count ?? 0) > 0}
                count={summary?.count ?? 0}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
});
