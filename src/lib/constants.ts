import { colors } from "@/theme/tokens";
import { CalendarCheck, UtensilsCrossed, User } from "lucide-react-native";
import type { ComponentType } from "react";

export const CATEGORIES = ["event", "food", "personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    color: string;
    icon: ComponentType<{ size?: number; color?: string }>;
  }
> = {
  event: {
    label: "Eventos",
    color: colors.categoryEvent,
    icon: CalendarCheck,
  },
  food: {
    label: "Comida",
    color: colors.categoryFood,
    icon: UtensilsCrossed,
  },
  personal: { label: "Pessoal", color: colors.categoryPersonal, icon: User },
} as const;

export const LIMITS = {
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 2000,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;
