import type { CategoryCustomField, FieldType } from '@/types';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Text, View, XStack } from 'tamagui';

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto',
  textarea: 'Texto longo',
  number: 'Número',
  checkbox: 'Checkbox',
  select: 'Seleção',
  rating: 'Avaliação',
};

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  text: '#5B8DEF',
  textarea: '#8B5CF6',
  number: '#14B8A6',
  checkbox: '#F59E0B',
  select: '#EC4899',
  rating: '#FB923C',
};

interface CustomFieldListItemProps {
  field: CategoryCustomField;
  onEdit: (field: CategoryCustomField) => void;
  onDelete: (fieldId: string) => void;
}

export function CustomFieldListItem({ field, onEdit, onDelete }: CustomFieldListItemProps) {
  const color = FIELD_TYPE_COLORS[field.field_type];

  return (
    <XStack paddingVertical="$2" paddingHorizontal="$1" alignItems="center" gap="$2">
      {/* Type badge */}
      <View
        backgroundColor={`${color}20`}
        borderRadius={6}
        paddingHorizontal={8}
        paddingVertical={3}
      >
        <Text color={color} fontSize={10} fontWeight="600">
          {FIELD_TYPE_LABELS[field.field_type]}
        </Text>
      </View>

      {/* Name */}
      <Text color="rgba(245,240,232,0.8)" fontSize={14} flex={1} numberOfLines={1}>
        {field.name}
      </Text>

      {/* Options count for select */}
      {field.field_type === 'select' && field.options.length > 0 && (
        <Text color="rgba(245,240,232,0.35)" fontSize={11}>
          {field.options.length} opç{field.options.length === 1 ? 'ão' : 'ões'}
        </Text>
      )}

      {/* Actions */}
      <XStack gap="$2">
        <Pressable onPress={() => onEdit(field)} hitSlop={8}>
          <Pencil size={13} color="rgba(245,240,232,0.4)" />
        </Pressable>
        <Pressable onPress={() => onDelete(field.id)} hitSlop={8}>
          <Trash2 size={13} color="#EF4444" />
        </Pressable>
      </XStack>
    </XStack>
  );
}
