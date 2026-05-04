import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const PRESET_COLORS = [
  '#E08A38',
  '#4CAF50',
  '#5B8DEF',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#06B6D4',
  '#84CC16',
  '#A855F7',
  '#FB7185',
  '#22D3EE',
  '#FBBF24',
  '#34D399',
  '#818CF8',
  '#F472B6',
  '#2DD4BF',
  '#FB923C',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (text: string) => {
    setHexInput(text);
    if (/^#[0-9a-fA-F]{6}$/.test(text)) {
      onChange(text);
    }
  };

  return (
    <YStack gap="$2">
      <XStack flexWrap="wrap" gap="$2">
        {PRESET_COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              onChange(color);
              setHexInput(color);
            }}
          >
            <YStack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={color}
              borderWidth={value === color ? 3 : 1}
              borderColor={value === color ? '#fff' : 'rgba(255,255,255,0.15)'}
            />
          </Pressable>
        ))}
      </XStack>

      <XStack alignItems="center" gap="$2">
        <YStack
          width={32}
          height={32}
          borderRadius={16}
          backgroundColor={value}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.15)"
        />
        <TextInput
          value={hexInput}
          onChangeText={handleHexChange}
          placeholder="#RRGGBB"
          placeholderTextColor="rgba(245,240,232,0.35)"
          maxLength={7}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.10)',
            color: '#F5F0E8',
            paddingHorizontal: 12,
            fontSize: 14,
            fontFamily: 'monospace',
          }}
        />
      </XStack>

      {hexInput.length > 0 && !/^#[0-9a-fA-F]{6}$/.test(hexInput) && (
        <Text color="$error" fontSize={11}>
          Formato: #RRGGBB
        </Text>
      )}
    </YStack>
  );
}
