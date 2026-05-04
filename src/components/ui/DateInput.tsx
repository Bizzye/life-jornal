import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

const ACCENT = '#E08A38';
const TEXT = '#F5F0E8';
const TEXT_DIM = 'rgba(245,240,232,0.6)';
const BORDER = 'rgba(255,255,255,0.10)';

interface DateInputProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatDisplayDate(value: string): string {
  if (!value) return '';
  const d = new Date(value + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function DateInput({ value, onChange, placeholder }: DateInputProps) {
  const [show, setShow] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <XStack
        backgroundColor="rgba(255,255,255,0.06)"
        borderRadius="$3"
        borderWidth={1}
        borderColor={BORDER}
        height={40}
        alignItems="center"
        paddingHorizontal="$3"
        gap="$2"
      >
        <Calendar size={16} color={ACCENT} />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: TEXT,
            fontSize: 16,
            fontFamily: 'inherit',
            width: '100%',
            colorScheme: 'dark',
          }}
        />
      </XStack>
    );
  }

  const dateValue = value ? new Date(value + 'T12:00:00') : new Date();

  return (
    <>
      <Pressable onPress={() => setShow(true)}>
        <XStack
          backgroundColor="rgba(255,255,255,0.06)"
          borderRadius="$3"
          borderWidth={1}
          borderColor={BORDER}
          height={40}
          alignItems="center"
          paddingHorizontal="$3"
          gap="$2"
        >
          <Calendar size={16} color={ACCENT} />
          <Text color={value ? TEXT : TEXT_DIM} fontSize="$3" flex={1}>
            {value ? formatDisplayDate(value) : (placeholder ?? 'Selecione a data')}
          </Text>
        </XStack>
      </Pressable>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShow(false);
            if (selected) {
              const y = selected.getFullYear();
              const m = String(selected.getMonth() + 1).padStart(2, '0');
              const d = String(selected.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
            }
          }}
        />
      )}
    </>
  );
}
