import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import type { CategoryCustomField } from '@/types';
import { Star } from 'lucide-react-native';
import { Pressable, Switch, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface CustomFieldRendererProps {
  field: CategoryCustomField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export function CustomFieldRenderer({ field, value, onChange }: CustomFieldRendererProps) {
  return (
    <YStack gap="$1.5">
      <Text color="rgba(245,240,232,0.6)" fontSize={13} fontWeight="500">
        {field.name}
      </Text>
      {renderInput(field, value, onChange)}
    </YStack>
  );
}

function renderInput(
  field: CategoryCustomField,
  value: string | number | boolean | undefined,
  onChange: (value: string | number | boolean) => void,
) {
  switch (field.field_type) {
    case 'text':
      return (
        <Input
          placeholder={field.name}
          value={String(value ?? '')}
          onChangeText={(v) => onChange(v)}
        />
      );

    case 'textarea':
      return (
        <TextArea
          placeholder={field.name}
          value={String(value ?? '')}
          onChangeText={(v) => onChange(v)}
          minHeight={80}
        />
      );

    case 'number':
      return (
        <Input
          placeholder="0"
          value={value !== undefined && value !== '' ? String(value) : ''}
          onChangeText={(v) => {
            if (v === '' || v === '-') {
              onChange(v);
              return;
            }
            const num = Number(v);
            if (!isNaN(num)) onChange(num);
          }}
          keyboardType="numeric"
        />
      );

    case 'checkbox':
      return (
        <XStack alignItems="center" gap="$3" paddingVertical="$1">
          <Switch
            value={!!value}
            onValueChange={(v) => onChange(v)}
            trackColor={{
              false: 'rgba(255,255,255,0.12)',
              true: 'rgba(224,138,56,0.5)',
            }}
            thumbColor={value ? '#E08A38' : '#888'}
          />
          <Text color="rgba(245,240,232,0.7)" fontSize={14}>
            {value ? 'Sim' : 'Não'}
          </Text>
        </XStack>
      );

    case 'select':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={(v) => onChange(v)}
          placeholder="Selecione..."
          options={field.options.map((opt) => ({ label: opt, value: opt }))}
        />
      );

    case 'rating':
      return <StarRating value={Number(value ?? 0)} onChange={(v) => onChange(v)} />;

    default:
      return null;
  }
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <XStack gap="$1.5" paddingVertical="$1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star === value ? 0 : star)} hitSlop={4}>
          <View
            style={{
              padding: 4,
            }}
          >
            <Star
              size={28}
              color="#E08A38"
              fill={star <= value ? '#E08A38' : 'transparent'}
              strokeWidth={1.5}
            />
          </View>
        </Pressable>
      ))}
    </XStack>
  );
}
