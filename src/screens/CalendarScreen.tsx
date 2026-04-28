import { DayDetailList } from "@/components/calendar/DayDetailList";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WeekStrip } from "@/components/calendar/WeekStrip";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { useCalendarEntries } from "@/hooks/useCalendarEntries";
import { colors } from "@/theme/tokens";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function CalendarScreen() {
  const {
    currentMonth,
    loading,
    daySummaries,
    selectedDate,
    setSelectedDate,
    selectedRegistros,
    goToPrevMonth,
    goToNextMonth,
    goToMonth,
    goToYear,
    goToToday,
  } = useCalendarEntries();

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleDayPress = useCallback(
    (dateKey: string) => {
      setSelectedDate(selectedDate === dateKey ? null : dateKey);
    },
    [selectedDate, setSelectedDate],
  );

  const handleExpandPress = useCallback(() => {
    setSelectedDate(null);
  }, [setSelectedDate]);

  const handleWeekChange = useCallback(
    (dateKey: string) => {
      setSelectedDate(dateKey);
    },
    [setSelectedDate],
  );

  const monthLabel = MONTH_NAMES[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  const isViewingToday =
    selectedDate === todayKey &&
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom="$3"
        >
          <Pressable onPress={goToPrevMonth} hitSlop={14} style={s.arrowBtn}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </Pressable>

          <YStack alignItems="center" gap={2}>
            <Pressable
              onPress={() => setShowMonthPicker(true)}
              style={s.headerPill}
            >
              <Text color={colors.textPrimary} fontSize={24} fontWeight="800">
                {monthLabel}
              </Text>
              <ChevronDown size={16} color={colors.accent} />
            </Pressable>

            <Pressable
              onPress={() => setShowYearPicker(true)}
              style={s.yearPill}
            >
              <Text color={colors.textMuted} fontSize={14} fontWeight="600">
                {year}
              </Text>
              <ChevronDown size={12} color={colors.textMuted} />
            </Pressable>
          </YStack>

          <Pressable onPress={goToNextMonth} hitSlop={14} style={s.arrowBtn}>
            <ChevronRight size={22} color={colors.textSecondary} />
          </Pressable>
        </XStack>

        {/* Botão Hoje */}
        {!isViewingToday && (
          <Pressable style={s.todayButton} onPress={goToToday}>
            <Calendar size={14} color={colors.accent} />
            <Text color={colors.accent} fontSize={13} fontWeight="700">
              Hoje
            </Text>
          </Pressable>
        )}

        {/* Calendar */}
        {loading ? (
          <YStack padding="$6" alignItems="center">
            <ActivityIndicator color={colors.accent} />
          </YStack>
        ) : selectedDate ? (
          <WeekStrip
            selectedDate={selectedDate}
            daySummaries={daySummaries}
            onDayPress={handleDayPress}
            onExpandPress={handleExpandPress}
            onWeekChange={handleWeekChange}
          />
        ) : (
          <MonthGrid
            currentMonth={currentMonth}
            daySummaries={daySummaries}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
          />
        )}

        {/* Day Detail */}
        <DayDetailList date={selectedDate} registros={selectedRegistros} />
      </ScrollView>

      {/* ─── Month Picker ─── */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowMonthPicker(false)}>
          <Pressable style={s.pickerCard} onPress={(e) => e.stopPropagation()}>
            <Text
              color={colors.textPrimary}
              fontSize={20}
              fontWeight="700"
              textAlign="center"
              marginBottom={20}
            >
              Selecione o mês
            </Text>
            <View style={s.monthGrid}>
              {MONTH_SHORT.map((name, i) => {
                const isActive = i === currentMonth.getMonth();
                const isCurrentMonth =
                  i === new Date().getMonth() &&
                  year === new Date().getFullYear();
                return (
                  <Pressable
                    key={i}
                    style={[s.monthCell, isActive && s.cellActive]}
                    onPress={() => {
                      goToMonth(i);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      color={
                        isActive
                          ? colors.accent
                          : isCurrentMonth
                            ? colors.textPrimary
                            : colors.textSecondary
                      }
                      fontSize={15}
                      fontWeight={isActive ? "800" : "500"}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Year Picker ─── */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowYearPicker(false)}>
          <Pressable style={s.pickerCard} onPress={(e) => e.stopPropagation()}>
            <Text
              color={colors.textPrimary}
              fontSize={20}
              fontWeight="700"
              textAlign="center"
              marginBottom={20}
            >
              Selecione o ano
            </Text>
            <View style={s.yearGrid}>
              {Array.from({ length: 7 }, (_, i) => year - 3 + i).map((y) => {
                const isActive = y === year;
                const isCurrent = y === new Date().getFullYear();
                return (
                  <Pressable
                    key={y}
                    style={[s.yearCell, isActive && s.cellActive]}
                    onPress={() => {
                      goToYear(y);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text
                      color={
                        isActive
                          ? colors.accent
                          : isCurrent
                            ? colors.textPrimary
                            : colors.textSecondary
                      }
                      fontSize={18}
                      fontWeight={isActive ? "800" : "500"}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  arrowBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(224, 138, 56, 0.12)",
    marginBottom: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCard: {
    backgroundColor: "#1E221E",
    borderRadius: 20,
    padding: 24,
    width: 340,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  monthCell: {
    width: "30%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  yearCell: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  cellActive: {
    backgroundColor: "rgba(224, 138, 56, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(224, 138, 56, 0.4)",
  },
});
