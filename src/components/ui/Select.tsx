import { useState } from "react";
import { YStack, Text, XStack } from "tamagui";
import { Pressable, Modal, FlatList, View } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const ACCENT = "#E08A38";
const TEXT_DIM = "rgba(245,240,232,0.6)";
const TEXT = "#F5F0E8";
const BORDER = "rgba(255,255,255,0.10)";
const BORDER_FOCUS = "rgba(224,138,56,0.5)";
const BG_ITEM_SELECTED = "rgba(224,138,56,0.12)";

export function Select({ options, value, onValueChange, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        {({ pressed }) => (
          <XStack
            backgroundColor="rgba(255,255,255,0.06)"
            borderRadius="$3"
            borderWidth={1}
            borderColor={pressed ? BORDER_FOCUS : BORDER}
            paddingHorizontal="$3"
            height={52}
            alignItems="center"
            justifyContent="space-between"
            opacity={pressed ? 0.85 : 1}
          >
            <XStack alignItems="center" gap="$2" flex={1}>
              {selected?.icon}
              <Text color={selected ? TEXT : TEXT_DIM} fontSize="$3">
                {selected ? selected.label : (placeholder ?? "Selecione...")}
              </Text>
            </XStack>
            <ChevronDown
              size={18}
              color={TEXT_DIM}
              style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
            />
          </XStack>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: "#1A1E1A",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderWidth: 1,
                borderColor: BORDER,
                borderBottomWidth: 0,
                paddingVertical: 8,
                paddingBottom: 24,
              }}
            >
              {/* Handle bar */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignSelf: "center",
                  marginBottom: 12,
                  marginTop: 4,
                }}
              />

              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const isSelected = value === item.value;
                  return (
                    <Pressable
                      onPress={() => {
                        onValueChange(item.value);
                        setOpen(false);
                      }}
                    >
                      {({ pressed }) => (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            paddingVertical: 14,
                            backgroundColor: isSelected
                              ? BG_ITEM_SELECTED
                              : pressed
                              ? "rgba(255,255,255,0.04)"
                              : "transparent",
                          }}
                        >
                          <View style={{ marginRight: 14 }}>{item.icon}</View>
                          <Text
                            flex={1}
                            color={isSelected ? ACCENT : TEXT}
                            fontSize="$4"
                            fontWeight={isSelected ? "600" : "400"}
                          >
                            {item.label}
                          </Text>
                          {isSelected && <Check size={18} color={ACCENT} />}
                        </View>
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
