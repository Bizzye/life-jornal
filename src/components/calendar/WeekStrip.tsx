import type { DaySummary } from "@/hooks/useCalendarEntries";
import { colors } from "@/theme/tokens";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, XStack } from "tamagui";

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
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
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDays(dateKey: string) {
  const date = new Date(dateKey + "T12:00:00");
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
  const date = new Date(dateKey + "T12:00:00");
  date.setDate(date.getDate() + offset * 7);
  return toDateKey(date);
}

function getWeekRangeLabel(cells: ReturnType<typeof getWeekDays>): string {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const fDate = new Date(first.dateKey + "T12:00:00");
  const lDate = new Date(last.dateKey + "T12:00:00");
  const fDay = first.day;
  const lDay = last.day;

  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
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
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom={12}
      >
        <Pressable
          onPress={() => onWeekChange(shiftWeek(selectedDate, -1))}
          hitSlop={12}
          style={styles.navButton}
        >
          <ChevronLeft size={20} color={colors.textSecondary} />
        </Pressable>

        <Text color={colors.textSecondary} fontSize={14} fontWeight="600">
          {rangeLabel}
        </Text>

        <Pressable
          onPress={() => onWeekChange(shiftWeek(selectedDate, 1))}
          hitSlop={12}
          style={styles.navButton}
        >
          <ChevronRight size={20} color={colors.textSecondary} />
        </Pressable>
      </XStack>

      {/* Date numbers row */}
      <XStack justifyContent="space-around" marginBottom={2}>
        {cells.map((cell) => {
          const isActive = cell.dateKey === selectedDate;
          return (
            <Pressable
              key={cell.dateKey + "-num"}
              onPress={() => onDayPress(cell.dateKey)}
              style={{ width: CELL_SIZE, alignItems: "center" }}
            >
              <Text
                color={
                  isActive
                    ? colors.accent
                    : cell.isToday
                      ? colors.accent
                      : colors.textPrimary
                }
                fontSize={20}
                fontWeight={isActive || cell.isToday ? "800" : "500"}
              >
                {cell.day}
              </Text>
            </Pressable>
          );
        })}
      </XStack>

      {/* Weekday labels */}
      <XStack justifyContent="space-around" marginBottom={8}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text
            key={i}
            color={
              cells[i]?.dateKey === selectedDate
                ? colors.accent
                : colors.textMuted
            }
            fontSize={11}
            fontWeight="600"
            width={CELL_SIZE}
            textAlign="center"
          >
            {label}
          </Text>
        ))}
      </XStack>

      {/* Activity rings row */}
      <View style={styles.row}>
        {cells.map((cell) => {
          const summary = daySummaries.get(cell.dateKey);
          const count = summary?.count ?? 0;
          return (
            <Pressable
              key={cell.dateKey}
              onPress={() => onDayPress(cell.dateKey)}
              style={[
                styles.ringCell,
                cell.dateKey === selectedDate && styles.ringCellSelected,
              ]}
            >
              {count > 0 && <View style={styles.dotIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Expand to month */}
      <Pressable onPress={onExpandPress} style={styles.expandButton}>
        <Grid3X3 size={14} color={colors.textMuted} />
        <Text color={colors.textMuted} fontSize={11} fontWeight="500">
          Ver mês
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ringCell: {
    width: CELL_SIZE,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCellSelected: {
    opacity: 1,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 4,
  },
});
