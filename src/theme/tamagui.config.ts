import { createTamagui } from "@tamagui/core";
import { config } from "@tamagui/config/v3";
import { colors, palette } from "./tokens";

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    dark: {
      ...config.themes.dark,
      background: colors.bgPrimary,
      color: colors.textPrimary,
      accent: colors.accent,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      error: colors.error,
      categoryEvent: colors.categoryEvent,
      categoryFood: colors.categoryFood,
      categoryPersonal: colors.categoryPersonal,
      border: colors.border,
      borderFocus: colors.borderFocus,
      bgCard: colors.bgCard,
      bgInput: colors.bgInput,
    },
  },
});

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}
