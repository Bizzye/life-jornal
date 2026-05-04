import { CustomFieldListItem } from '@/components/settings/CustomFieldListItem';
import { colors } from '@/theme/tokens';
import type { CategoryCustomField, UserCategory } from '@/types';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text, XStack, YStack } from 'tamagui';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabKey = 'subcategories' | 'fields';

interface CategoryAccordionItemProps {
  category: UserCategory;
  onEdit: (category: UserCategory) => void;
  onDelete: (category: UserCategory) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (categoryId: string, subId: string, name: string) => void;
  onDeleteSubcategory: (categoryId: string, subId: string) => void;
  onAddCustomField: (categoryId: string) => void;
  onEditCustomField: (categoryId: string, field: CategoryCustomField) => void;
  onDeleteCustomField: (categoryId: string, fieldId: string) => void;
}

export function CategoryAccordionItem({
  category,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddCustomField,
  onEditCustomField,
  onDeleteCustomField,
}: CategoryAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('subcategories');

  const subsCount = category.subcategories.length;
  const fieldsCount = category.custom_fields.length;

  // Animated chevron rotation
  const chevronRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    chevronRotation.value = withSpring(open ? 180 : 0, { damping: 15, stiffness: 200 });
    contentOpacity.value = withTiming(open ? 1 : 0, { duration: 250 });
  }, [open]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const countParts: string[] = [];
  if (subsCount > 0) countParts.push(`${subsCount} sub`);
  if (fieldsCount > 0) countParts.push(`${fieldsCount} campo${fieldsCount !== 1 ? 's' : ''}`);
  const countText = countParts.join(' · ');

  return (
    <View style={[s.card, open && { borderColor: `${category.color}30` }]}>
      {/* Color accent bar */}
      <View style={[s.accentBar, { backgroundColor: category.color }]} />

      {/* Header */}
      <Pressable onPress={toggleOpen} style={s.header}>
        <View style={[s.colorDot, { backgroundColor: category.color }]} />

        <View style={s.titleBlock}>
          <View style={s.nameRow}>
            <Text color={colors.textPrimary} fontSize={16} fontWeight="700" fontFamily="$body">
              {category.name}
            </Text>
            {category.is_default && (
              <View style={s.badge}>
                <Text color={colors.textMuted} fontSize={10} fontWeight="500" fontFamily="$body">
                  PADRÃO
                </Text>
              </View>
            )}
          </View>
          {countText ? (
            <Text color={colors.textSecondary} fontSize={12} fontFamily="$body" marginTop={2}>
              {countText}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={s.actions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            hitSlop={10}
            style={s.iconBtn}
          >
            <Pencil size={15} color={colors.textMuted} />
          </Pressable>
          {!category.is_default && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              hitSlop={10}
              style={s.iconBtn}
            >
              <Trash2 size={15} color={colors.error} />
            </Pressable>
          )}
          <Animated.View style={chevronStyle}>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Animated.View>
        </View>
      </Pressable>

      {/* Expandable content */}
      {open && (
        <Animated.View style={[s.content, contentAnimStyle]}>
          <View style={s.divider} />

          {/* Tabs */}
          <View style={s.tabRow}>
            <TabButton
              label="Subcategorias"
              count={subsCount}
              active={activeTab === 'subcategories'}
              onPress={() => setActiveTab('subcategories')}
              color={category.color}
            />
            <TabButton
              label="Campos"
              count={fieldsCount}
              active={activeTab === 'fields'}
              onPress={() => setActiveTab('fields')}
              color={category.color}
            />
          </View>

          {/* Tab content */}
          {activeTab === 'subcategories' ? (
            <YStack gap="$1">
              {category.subcategories.map((sub) => (
                <View key={sub.id} style={s.listItem}>
                  <View style={[s.listDot, { backgroundColor: category.color }]} />
                  <Text color={colors.textPrimary} fontSize={14} fontFamily="$body" flex={1}>
                    {sub.name}
                  </Text>
                  <XStack gap="$2.5">
                    <Pressable
                      onPress={() => onEditSubcategory(category.id, sub.id, sub.name)}
                      hitSlop={8}
                      style={s.iconBtnSm}
                    >
                      <Pencil size={13} color={colors.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => onDeleteSubcategory(category.id, sub.id)}
                      hitSlop={8}
                      style={s.iconBtnSm}
                    >
                      <Trash2 size={13} color={colors.error} />
                    </Pressable>
                  </XStack>
                </View>
              ))}

              <Pressable onPress={() => onAddSubcategory(category.id)} style={s.addBtn}>
                <Plus size={14} color={category.color} />
                <Text color={category.color} fontSize={13} fontWeight="500" fontFamily="$body">
                  Adicionar subcategoria
                </Text>
              </Pressable>
            </YStack>
          ) : (
            <YStack gap="$1">
              {category.custom_fields.map((field) => (
                <CustomFieldListItem
                  key={field.id}
                  field={field}
                  onEdit={(f) => onEditCustomField(category.id, f)}
                  onDelete={(fId) => onDeleteCustomField(category.id, fId)}
                />
              ))}

              <Pressable onPress={() => onAddCustomField(category.id)} style={s.addBtn}>
                <Plus size={14} color={category.color} />
                <Text color={category.color} fontSize={13} fontWeight="500" fontFamily="$body">
                  Adicionar campo
                </Text>
              </Pressable>
            </YStack>
          )}
        </Animated.View>
      )}
    </View>
  );
}

/* Tab Button */
function TabButton({
  label,
  count,
  active,
  onPress,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.tab, active && { backgroundColor: `${color}18`, borderColor: `${color}50` }]}
    >
      <Text
        color={active ? color : colors.textMuted}
        fontSize={13}
        fontWeight={active ? '600' : '400'}
        fontFamily="$body"
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            s.tabBadge,
            { backgroundColor: active ? `${color}30` : 'rgba(255,255,255,0.08)' },
          ]}
        >
          <Text
            color={active ? color : colors.textMuted}
            fontSize={10}
            fontWeight="700"
            fontFamily="$body"
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/* Styles */
const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  titleBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  iconBtnSm: {
    padding: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  listDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.7,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
});
