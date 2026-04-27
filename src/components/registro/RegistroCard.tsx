import { createElement } from "react";
import { YStack, Text, XStack } from "tamagui";
import { GlassCard } from "@/components/ui/GlassCard";
import { Chip } from "@/components/ui/Chip";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getCategoryColor, formatTime } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { Registro } from "@/types";

interface RegistroCardProps {
  registro: Registro;
  onPress?: () => void;
}

export function RegistroCard({ registro, onPress }: RegistroCardProps) {
  const color = getCategoryColor(registro.category);
  const config = CATEGORY_CONFIG[registro.category];

  return (
    <GlassCard
      elevated
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      marginBottom="$3"
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$2"
      >
        <Chip
          label={config.label}
          icon={createElement(config.icon, { size: 14, color: "#fff" })}
          color={color}
          selected
        />
        <Text color="$textSecondary" fontSize="$1">
          {formatTime(registro.created_at)}
        </Text>
      </XStack>

      <Text color="$color" fontSize="$4" fontWeight="600" marginBottom="$1">
        {registro.title}
      </Text>

      {registro.body ? (
        <Text color="$textSecondary" fontSize="$2" numberOfLines={3}>
          {registro.body}
        </Text>
      ) : null}

      {registro.photo_urls?.length > 0 && (
        <YStack marginTop="$2">
          <ImageCarousel images={registro.photo_urls} height={180} />
        </YStack>
      )}
    </GlassCard>
  );
}
