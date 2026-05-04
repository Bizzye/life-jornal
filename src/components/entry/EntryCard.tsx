import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { CATEGORY_CONFIG, type Category } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import { useCategoryStore } from '@/stores/category.store';
import type { Registro } from '@/types';
import { Clock, Image as ImageIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface EntryCardProps {
  registro: Registro;
  onPress?: () => void;
}

export function EntryCard({ registro, onPress }: EntryCardProps) {
  const categories = useCategoryStore((s) => s.categories);

  const dynamicCat = registro.category_id
    ? categories.find((c) => c.id === registro.category_id)
    : null;
  const legacyConfig = registro.category ? CATEGORY_CONFIG[registro.category as Category] : null;

  const color = dynamicCat?.color ?? legacyConfig?.color ?? '#E08A38';
  const label = dynamicCat?.name ?? legacyConfig?.label ?? 'Registro';
  const subLabel =
    registro.subcategory_id && dynamicCat
      ? dynamicCat.subcategories?.find((s) => s.id === registro.subcategory_id)?.name
      : null;

  const hasPhotos = registro.photo_urls?.length > 0;
  const photoCount = registro.photo_urls?.length ?? 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && s.cardPressed]}>
      <View style={s.inner}>
        {/* Left accent */}
        <View style={[s.accentLine, { backgroundColor: color }]} />

        <YStack flex={1}>
          {/* Photo */}
          {hasPhotos && (
            <View style={s.imageWrap}>
              <ImageCarousel images={registro.photo_urls} aspectRatio={16 / 9} />
              {photoCount > 1 && (
                <View style={s.photoBadge}>
                  <ImageIcon size={10} color="#fff" />
                  <Text color="#fff" fontSize={10} fontWeight="600" marginLeft={3}>
                    {photoCount}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Text content */}
          <YStack paddingHorizontal="$3" paddingVertical="$2.5" gap="$1.5">
            {/* Title */}
            <Text color="#F5F0E8" fontSize={15} fontWeight="700" numberOfLines={1}>
              {registro.title}
            </Text>

            {/* Body preview */}
            {registro.body ? (
              <Text color="rgba(245,240,232,0.55)" fontSize={13} numberOfLines={2} lineHeight={18}>
                {registro.body}
              </Text>
            ) : null}

            {/* Footer: category + time */}
            <XStack alignItems="center" gap="$2" marginTop="$1">
              <View style={[s.categoryChip, { backgroundColor: `${color}20` }]}>
                <View style={[s.chipDot, { backgroundColor: color }]} />
                <Text color={color} fontSize={11} fontWeight="600">
                  {label}
                </Text>
              </View>

              {subLabel && (
                <View style={[s.categoryChip, { backgroundColor: `${color}12` }]}>
                  <Text color={`${color}CC`} fontSize={11} fontWeight="500">
                    {subLabel}
                  </Text>
                </View>
              )}

              <XStack flex={1} />

              <XStack alignItems="center" gap={4}>
                <Clock size={11} color="rgba(245,240,232,0.35)" />
                <Text color="rgba(245,240,232,0.35)" fontSize={11}>
                  {formatTime(registro.event_date)}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </YStack>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inner: {
    flexDirection: 'row',
  },
  accentLine: {
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  imageWrap: {
    position: 'relative',
  },
  photoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
