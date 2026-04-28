import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatTime, getCategoryColor } from "@/lib/utils";
import type { Registro } from "@/types";
import { createElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface EntryCardProps {
  registro: Registro;
  onPress?: () => void;
}

export function EntryCard({ registro, onPress }: EntryCardProps) {
  const color = getCategoryColor(registro.category);
  const config = CATEGORY_CONFIG[registro.category];
  const hasPhotos = registro.photo_urls?.length > 0;

  return (
    <Pressable onPress={onPress} style={s.card}>
      <View style={s.inner}>
        {/* Left category accent line */}
        <View style={[s.accentLine, { backgroundColor: color }]} />

        {/* Content */}
        <View style={s.content}>
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            paddingTop="$3"
            paddingBottom="$2"
          >
            <View style={[s.categoryDot, { backgroundColor: color }]}>
              {createElement(config.icon, { size: 14, color: "#fff" })}
            </View>
            <YStack flex={1}>
              <Text
                color="#F5F0E8"
                fontSize={16}
                fontWeight="700"
                numberOfLines={1}
              >
                {registro.title}
              </Text>
              <Text color="rgba(245,240,232,0.5)" fontSize={12}>
                {config.label} · {formatTime(registro.created_at)}
              </Text>
            </YStack>
          </XStack>

          {/* Image area */}
          {hasPhotos && (
            <ImageCarousel images={registro.photo_urls} aspectRatio={4 / 3} />
          )}

          {/* Body text */}
          {registro.body ? (
            <Text
              color="rgba(245,240,232,0.65)"
              fontSize={13}
              numberOfLines={2}
              paddingHorizontal="$3"
              paddingTop={hasPhotos ? "$2" : 0}
              paddingBottom="$3"
              lineHeight={19}
            >
              {registro.body}
            </Text>
          ) : (
            <View style={{ height: 12 }} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inner: {
    flexDirection: "row",
  },
  accentLine: {
    width: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  content: {
    flex: 1,
  },
  categoryDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
