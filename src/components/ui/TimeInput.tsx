import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

const ACCENT = '#E08A38';
const TEXT = '#F5F0E8';
const TEXT_DIM = 'rgba(245,240,232,0.6)';
const BORDER = 'rgba(255,255,255,0.10)';

interface TimeInputProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TimeInput({ value, onChange, placeholder }: TimeInputProps) {
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
        <Clock size={16} color={ACCENT} />
        <input
          type="time"
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

  const [hours, minutes] = (value || '12:00').split(':').map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);

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
          <Clock size={16} color={ACCENT} />
          <Text color={value ? TEXT : TEXT_DIM} fontSize="$3" flex={1}>
            {value || (placeholder ?? 'Selecione a hora')}
          </Text>
        </XStack>
      </Pressable>
      {show && (
        <DateTimePicker
          value={timeDate}
          mode="time"
          is24Hour
          display="default"
          onChange={(_, selected) => {
            setShow(false);
            if (selected) {
              const h = String(selected.getHours()).padStart(2, '0');
              const m = String(selected.getMinutes()).padStart(2, '0');
              onChange(`${h}:${m}`);
            }
          }}
        />
      )}
    </>
  );
}
