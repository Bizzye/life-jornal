import { Category } from "@/lib/constants";
import { colors } from "@/theme/tokens";

export function getCategoryColor(category: Category): string {
  const map: Record<Category, string> = {
    event: colors.categoryEvent,
    food: colors.categoryFood,
    personal: colors.categoryPersonal,
  };
  return map[category];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function nowTime(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDayHeader(dateStr: string): string {
  const today = todayISO();
  const d = new Date(dateStr);
  const iso = d.toISOString().split("T")[0];

  if (iso === today) return "Hoje";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === yesterday.toISOString().split("T")[0]) return "Ontem";

  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
