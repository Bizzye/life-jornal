import type { UserCategory } from '@/types';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface CategoryListItemProps {
  category: UserCategory;
  onEdit: (category: UserCategory) => void;
  onDelete: (category: UserCategory) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (categoryId: string, subId: string, name: string) => void;
  onDeleteSubcategory: (categoryId: string, subId: string) => void;
}

export function CategoryListItem({
  category,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: CategoryListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = category.subcategories.length > 0;

  return (
    <YStack
      backgroundColor="rgba(255,255,255,0.06)"
      borderRadius={12}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.08)"
      overflow="hidden"
    >
      {/* Category row */}
      <Pressable onPress={() => setExpanded(!expanded)}>
        <XStack paddingHorizontal="$3" paddingVertical="$3" alignItems="center" gap="$2">
          {/* Color dot */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: category.color,
            }}
          />

          {/* Name + badge */}
          <YStack flex={1}>
            <XStack alignItems="center" gap="$1.5">
              <Text color="#F5F0E8" fontSize={15} fontWeight="600">
                {category.name}
              </Text>
              {category.is_default && (
                <Text color="rgba(245,240,232,0.4)" fontSize={11}>
                  (padrão)
                </Text>
              )}
            </XStack>
            {hasSubs && (
              <Text color="rgba(245,240,232,0.4)" fontSize={11}>
                {category.subcategories.length} subcategoria
                {category.subcategories.length !== 1 ? 's' : ''}
              </Text>
            )}
          </YStack>

          {/* Actions */}
          <XStack gap="$2" alignItems="center">
            <Pressable onPress={() => onEdit(category)} hitSlop={8}>
              <Pencil size={16} color="rgba(245,240,232,0.5)" />
            </Pressable>
            {!category.is_default && (
              <Pressable onPress={() => onDelete(category)} hitSlop={8}>
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            )}
            {expanded ? (
              <ChevronDown size={16} color="rgba(245,240,232,0.4)" />
            ) : (
              <ChevronRight size={16} color="rgba(245,240,232,0.4)" />
            )}
          </XStack>
        </XStack>
      </Pressable>

      {/* Subcategories */}
      {expanded && (
        <YStack
          paddingHorizontal="$3"
          paddingBottom="$3"
          gap="$1"
          borderTopWidth={1}
          borderTopColor="rgba(255,255,255,0.06)"
        >
          {category.subcategories.map((sub) => (
            <XStack key={sub.id} paddingVertical="$2" paddingLeft="$4" alignItems="center" gap="$2">
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: category.color,
                  opacity: 0.6,
                }}
              />
              <Text color="rgba(245,240,232,0.8)" fontSize={14} flex={1}>
                {sub.name}
              </Text>
              <XStack gap="$2">
                <Pressable
                  onPress={() => onEditSubcategory(category.id, sub.id, sub.name)}
                  hitSlop={8}
                >
                  <Pencil size={13} color="rgba(245,240,232,0.4)" />
                </Pressable>
                <Pressable onPress={() => onDeleteSubcategory(category.id, sub.id)} hitSlop={8}>
                  <Trash2 size={13} color="#EF4444" />
                </Pressable>
              </XStack>
            </XStack>
          ))}

          {/* Add subcategory button */}
          <Pressable onPress={() => onAddSubcategory(category.id)}>
            <XStack
              paddingVertical="$2"
              paddingLeft="$4"
              alignItems="center"
              gap="$2"
              opacity={0.6}
            >
              <Plus size={14} color="rgba(245,240,232,0.5)" />
              <Text color="rgba(245,240,232,0.5)" fontSize={13}>
                Adicionar subcategoria
              </Text>
            </XStack>
          </Pressable>
        </YStack>
      )}
    </YStack>
  );
}
