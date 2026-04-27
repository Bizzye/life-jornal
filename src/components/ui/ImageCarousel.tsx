import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { XStack } from "tamagui";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";

const ACCENT = "#E08A38";

interface ImageCarouselProps {
  images: string[];
  onRemove?: (index: number) => void;
  height?: number;
  editable?: boolean;
}

export function ImageCarousel({
  images,
  onRemove,
  height = 200,
  editable = false,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const safeIndex = Math.min(activeIndex, images.length - 1);

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setActiveIndex((i) => Math.min(images.length - 1, i + 1));

  return (
    <View
      style={{ borderRadius: 12, overflow: "hidden", position: "relative" }}
    >
      {/* Current image */}
      <Image
        source={{ uri: images[safeIndex] }}
        style={{ width: "100%", height }}
        resizeMode="cover"
      />

      {/* Remove button */}
      {editable && onRemove && (
        <Pressable
          onPress={() => {
            onRemove(safeIndex);
            setActiveIndex((i) => Math.max(0, i - 1));
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 14,
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} color="#fff" />
        </Pressable>
      )}

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          {safeIndex > 0 && (
            <Pressable
              onPress={goPrev}
              style={{
                position: "absolute",
                left: 6,
                top: "50%",
                marginTop: -16,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 16,
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={18} color="#fff" />
            </Pressable>
          )}
          {safeIndex < images.length - 1 && (
            <Pressable
              onPress={goNext}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                marginTop: -16,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 16,
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={18} color="#fff" />
            </Pressable>
          )}
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <XStack
          justifyContent="center"
          gap={6}
          position="absolute"
          bottom={8}
          left={0}
          right={0}
        >
          {images.map((_, i) => (
            <Pressable key={i} onPress={() => setActiveIndex(i)}>
              <View
                style={{
                  width: safeIndex === i ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    safeIndex === i ? ACCENT : "rgba(255,255,255,0.4)",
                }}
              />
            </Pressable>
          ))}
        </XStack>
      )}
    </View>
  );
}
