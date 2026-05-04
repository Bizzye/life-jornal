import { entryService } from "@/services/entry.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Category, Registro } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

function monthRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  // Pad by 7 days on each side so cross-month weeks have data
  const start = new Date(y, m, 1 - 7);
  const end = new Date(y, m + 1, 7, 23, 59, 59);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function groupByDay(registros: Registro[]): Map<string, Registro[]> {
  const map = new Map<string, Registro[]>();
  for (const r of registros) {
    const day = new Date(r.event_date).toISOString().split("T")[0];
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(r);
  }
  return map;
}

export type DaySummary = {
  count: number;
  categories: Set<Category>;
  registros: Registro[];
};

export function useCalendarEntries() {
  const userId = useAuthStore((s) => s.user?.id);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchMonth = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { start, end } = monthRange(currentMonth);
      const data = await entryService.listByDateRange(userId, start, end);
      setRegistros(data);
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const registrosByDay = useMemo(() => groupByDay(registros), [registros]);

  const daySummaries = useMemo(() => {
    const map = new Map<string, DaySummary>();
    for (const [day, regs] of registrosByDay) {
      map.set(day, {
        count: regs.length,
        categories: new Set(regs.map((r) => r.category)),
        registros: regs,
      });
    }
    return map;
  }, [registrosByDay]);

  const selectedRegistros = useMemo(() => {
    if (!selectedDate) return [];
    return registrosByDay.get(selectedDate) ?? [];
  }, [selectedDate, registrosByDay]);

  const goToPrevMonth = useCallback(() => {
    setSelectedDate(null);
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedDate(null);
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }, []);

  const goToMonth = useCallback((month: number) => {
    setSelectedDate(null);
    setCurrentMonth((prev) => new Date(prev.getFullYear(), month, 1));
  }, []);

  const goToYear = useCallback((year: number) => {
    setSelectedDate(null);
    setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1));
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayKey);
  }, []);

  /** Navigate to an arbitrary date — updates month if needed so data is fetched */
  const goToDate = useCallback((dateKey: string) => {
    const [y, m] = dateKey.split("-").map(Number);
    setCurrentMonth((prev) => {
      if (prev.getFullYear() === y && prev.getMonth() === m - 1) return prev;
      return new Date(y, m - 1, 1);
    });
    setSelectedDate(dateKey);
  }, []);

  return {
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
    goToDate,
    refetch: fetchMonth,
  };
}
