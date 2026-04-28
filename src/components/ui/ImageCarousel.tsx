import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";
import { XStack } from "tamagui";

const ACCENT = "#E08A38";
const DOT_SIZE = 6;

interface ImageCarouselProps {
  images: string[];
  onRemove?: (index: number) => void;
  height?: number;
  aspectRatio?: number;
  editable?: boolean;
}

export function ImageCarousel({
  images,
  onRemove,
  height,
  aspectRatio,
  editable = false,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  if (images.length === 0) return null;

  const total = images.length;
  const safeIndex = Math.min(activeIndex, total - 1);
  const canPrev = safeIndex > 0;
  const canNext = safeIndex < total - 1;

  const goPrev = () => canPrev && carouselRef.current?.prev();
  const goNext = () => canNext && carouselRef.current?.next();

  const imageHeight =
    height ?? (aspectRatio ? containerWidth / aspectRatio : 200);

  const containerStyle = aspectRatio
    ? {
        width: "100%" as const,
        aspectRatio,
        overflow: "hidden" as const,
        position: "relative" as const,
      }
    : {
        borderRadius: 12,
        overflow: "hidden" as const,
        position: "relative" as const,
      };

  if (containerWidth === 0) {
    return (
      <View
        style={containerStyle}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      />
    );
  }

  return (
    <View
      style={containerStyle}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Carousel
        ref={carouselRef}
        data={images}
        width={containerWidth}
        height={imageHeight}
        loop={false}
        enabled={total > 1}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: containerWidth, height: imageHeight }}
            resizeMode="cover"
          />
        )}
      />

      {/* Remove button (edit mode) */}
      {editable && onRemove && (
        <Pressable
          onPress={() => {
            onRemove(safeIndex);
            setActiveIndex((i) => Math.max(0, i - 1));
          }}
          style={s.removeBtn}
        >
          <X size={16} color="#fff" />
        </Pressable>
      )}

      {/* Arrow buttons */}
      {total > 1 && canPrev && (
        <Pressable
          onPress={goPrev}
          style={[s.arrowBtn, s.arrowLeft]}
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
      )}
      {total > 1 && canNext && (
        <Pressable
          onPress={goNext}
          style={[s.arrowBtn, s.arrowRight]}
          hitSlop={8}
        >
          <ChevronRight size={20} color="#fff" />
        </Pressable>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <XStack
          justifyContent="center"
          gap={5}
          position="absolute"
          bottom={10}
          left={0}
          right={0}
        >
          {images.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                carouselRef.current?.scrollTo({ index: i, animated: true });
              }}
            >
              <View
                style={[s.dot, i === safeIndex ? s.dotActive : s.dotInactive]}
              />
            </Pressable>
          ))}
        </XStack>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotActive: {
    backgroundColor: ACCENT,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
