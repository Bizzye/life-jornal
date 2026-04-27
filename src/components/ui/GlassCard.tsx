import { styled, YStack } from "tamagui";

export const GlassCard = styled(YStack, {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  padding: "$4",
  variants: {
    elevated: {
      true: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    },
  } as const,
});
