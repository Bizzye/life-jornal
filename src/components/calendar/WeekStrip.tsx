import type { DaySummary } from '@/hooks/useCalendarEntries';
import { colors } from '@/theme/tokens';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, XStack } from 'tamagui';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CELL_SIZE = 46;

interface WeekStripProps {
  selectedDate: string;
  daySummaries: Map<string, DaySummary>;
  onDayPress: (dateKey: string) => void;
  onExpandPress: () => void;
  onWeekChange: (dateKey: string) => void;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDays(dateKey: string) {
  const date = new Date(dateKey + 'T12:00:00');
  let dow = date.getDay() - 1;
  if (dow < 0) dow = 6;

  const monday = new Date(date);
  monday.setDate(date.getDate() - dow);

  const today = new Date();
  const todayKey = toDateKey(today);

  const cells = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    cells.push({
      day: d.getDate(),
      dateKey: key,
      isCurrentMonth: true,
      isToday: key === todayKey,
    });
  }
  return cells;
}

function shiftWeek(dateKey: string, offset: number): string {
  const date = new Date(dateKey + 'T12:00:00');
  date.setDate(date.getDate() + offset * 7);
  return toDateKey(date);
}

function getWeekRangeLabel(cells: ReturnType<typeof getWeekDays>): string {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const fDate = new Date(first.dateKey + 'T12:00:00');
  const lDate = new Date(last.dateKey + 'T12:00:00');
  const fDay = first.day;
  const lDay = last.day;

  const months = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  if (fDate.getMonth() === lDate.getMonth()) {
    return `${fDay}–${lDay} ${months[fDate.getMonth()]}`;
  }
  return `${fDay} ${months[fDate.getMonth()]} – ${lDay} ${months[lDate.getMonth()]}`;
}

export function WeekStrip({
  selectedDate,
  daySummaries,
  onDayPress,
  onExpandPress,
  onWeekChange,
}: WeekStripProps) {
  const cells = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const rangeLabel = useMemo(() => getWeekRangeLabel(cells), [cells]);

  return (
    <View style={styles.container}>
      {/* Week range + navigation */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom={14}>
        <Pressable
          onPress={() => onWeekChange(shiftWeek(selectedDate, -1))}
          hitSlop={12}
          style={styles.navButton}
        >
          <ChevronLeft size={18} color={colors.textSecondary} />
        </Pressable>

        <Text
          color={colors.textSecondary}
          fontSize={13}
          fontWeight="600"
          textTransform="capitalize"
        >
          {rangeLabel}
        </Text>

        <Pressable
          onPress={() => onWeekChange(shiftWeek(selectedDate, 1))}
          hitSlop={12}
          style={styles.navButton}
        >
          <ChevronRight size={18} color={colors.textSecondary} />
        </Pressable>
      </XStack>

      {/* Day cells */}
      <XStack justifyContent="space-around" marginBottom={6}>
        {cells.map((cell) => {
          const isActive = cell.dateKey === selectedDate;
          const summary = daySummaries.get(cell.dateKey);
          const count = summary?.count ?? 0;
          return (
            <Pressable
              key={cell.dateKey}
              onPress={() => onDayPress(cell.dateKey)}
              style={[
                styles.dayCell,
                isActive && styles.dayCellActive,
                cell.isToday && !isActive && styles.dayCellToday,
              ]}
            >
              <Text
                color={isActive ? 'rgba(255,255,255,0.6)' : colors.textMuted}
                fontSize={10}
                fontWeight="600"
              >
                {WEEKDAY_LABELS[cells.indexOf(cell)]}
              </Text>
              <Text
                color={isActive ? '#fff' : cell.isToday ? colors.accent : colors.textPrimary}
                fontSize={18}
                fontWeight={isActive || cell.isToday ? '700' : '500'}
              >
                {cell.day}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.dotIndicator,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : colors.accent,
                    },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </XStack>

      {/* Expand to month */}
      <Pressable onPress={onExpandPress} style={styles.expandButton}>
        <Grid3X3 size={13} color={colors.textMuted} />
        <Text color={colors.textMuted} fontSize={11} fontWeight="500">
          Ver mês completo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 3,
  },
  dayCellActive: {
    backgroundColor: colors.accent,
  },
  dayCellToday: {
    backgroundColor: 'rgba(224,138,56,0.12)',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 2,
  },
});
