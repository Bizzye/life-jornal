import { RegistroForm } from '@/components/entry/RegistroForm';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { CATEGORY_CONFIG, type Category } from '@/lib/constants';
import { friendlyError } from '@/lib/errorMessages';
import { formatDate, formatTime } from '@/lib/utils';
import type { EntryInput } from '@/schemas/entry.schema';
import { entryService } from '@/services/entry.service';
import { useCategoryStore } from '@/stores/category.store';
import { useEntryStore } from '@/stores/entry.store';
import { colors } from '@/theme/tokens';
import type { FieldType } from '@/types';
import { toast } from '@tamagui/v2-toast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Clock, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';

export function RegistroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const entries = useEntryStore((s) => s.entries);
  const updateEntry = useEntryStore((s) => s.updateEntry);
  const removeEntry = useEntryStore((s) => s.removeEntry);
  const storeCategories = useCategoryStore((s) => s.categories);

  const registro = entries.find((e) => e.id === id);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!registro) {
    return (
      <ScreenContainer>
        <Text color="$textPrimary" fontSize={18}>
          Registro não encontrado
        </Text>
      </ScreenContainer>
    );
  }

  // View mode: resolve category info
  const dynamicCat = registro.category_id
    ? storeCategories.find((c) => c.id === registro.category_id)
    : null;
  const legacyConfig = registro.category ? CATEGORY_CONFIG[registro.category as Category] : null;
  const categoryColor = dynamicCat?.color ?? legacyConfig?.color ?? colors.accent;
  const categoryLabel = dynamicCat?.name ?? legacyConfig?.label ?? 'Registro';
  const subLabel =
    registro.subcategory_id && dynamicCat
      ? dynamicCat.subcategories?.find((s) => s.id === registro.subcategory_id)?.name
      : null;

  const handleSave = async (data: EntryInput) => {
    const updated = await entryService.update(id, data);
    updateEntry(id, updated);
    setEditing(false);
  };

  const doDelete = async () => {
    try {
      await entryService.remove(id);
      removeEntry(id);
      router.back();
    } catch (err) {
      toast.error(friendlyError(err, 'Erro ao excluir registro'));
    }
  };

  const handleDelete = () => setDeleteOpen(true);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
          <XStack alignItems="center" gap="$2">
            <View
              onPress={() => router.back()}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
              padding="$1"
            >
              <ChevronLeft size={24} color={colors.textPrimary} />
            </View>
            <Text color="$textSecondary" fontSize={16} fontWeight="600">
              Detalhes
            </Text>
          </XStack>

          <XStack gap="$3">
            <View
              onPress={() => setEditing(!editing)}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
              padding="$1"
            >
              <Pencil size={20} color={editing ? colors.accent : colors.textSecondary} />
            </View>
            <View
              onPress={handleDelete}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
              padding="$1"
            >
              <Trash2 size={20} color={colors.error} />
            </View>
          </XStack>
        </XStack>

        {editing ? (
          /* ====== EDIT MODE — unified RegistroForm ====== */
          <RegistroForm registro={registro} onSubmit={handleSave} submitLabel="Salvar alterações" />
        ) : (
          /* ====== VIEW MODE ====== */
          <YStack gap="$4">
            {/* Photos */}
            {registro.photo_urls?.length > 0 && <ImageCarousel images={registro.photo_urls} />}

            {/* Category badge */}
            <XStack alignItems="center" gap="$2">
              <View
                backgroundColor={categoryColor}
                borderRadius={12}
                padding="$1"
                paddingHorizontal="$2"
              >
                <XStack alignItems="center" gap="$1">
                  <Text color="#fff" fontSize={12} fontWeight="600">
                    {categoryLabel}
                    {subLabel ? ` · ${subLabel}` : ''}
                  </Text>
                </XStack>
              </View>
            </XStack>

            {/* Title */}
            <Text color="$textPrimary" fontSize={24} fontWeight="800" lineHeight={30}>
              {registro.title}
            </Text>

            {/* Date/Time card */}
            <GlassCard padding="$3">
              <XStack alignItems="center" gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Calendar size={16} color={colors.accent} />
                  <Text color="$textSecondary" fontSize={14}>
                    {formatDate(registro.event_date)}
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <Clock size={16} color={colors.accent} />
                  <Text color="$textSecondary" fontSize={14}>
                    {formatTime(registro.event_date)}
                  </Text>
                </XStack>
              </XStack>
            </GlassCard>

            {/* Body */}
            {registro.body && (
              <GlassCard padding="$3">
                <Text color="$textPrimary" fontSize={14} lineHeight={22}>
                  {registro.body}
                </Text>
              </GlassCard>
            )}

            {/* Custom field values */}
            {(() => {
              const fieldValues = registro.custom_field_values;
              const fieldDefs = dynamicCat?.custom_fields ?? [];
              if (!fieldValues || Object.keys(fieldValues).length === 0 || fieldDefs.length === 0)
                return null;

              const filledFields = fieldDefs.filter(
                (f) => fieldValues[f.id] !== undefined && fieldValues[f.id] !== '',
              );
              if (filledFields.length === 0) return null;

              return (
                <GlassCard padding="$3">
                  <YStack gap="$2">
                    <Text
                      color="$textMuted"
                      fontSize={11}
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing={1}
                    >
                      Campos adicionais
                    </Text>
                    {filledFields.map((field) => {
                      const val = fieldValues[field.id];
                      return (
                        <XStack key={field.id} justifyContent="space-between" alignItems="center">
                          <Text color="$textSecondary" fontSize={13}>
                            {field.name}
                          </Text>
                          <Text color="$textPrimary" fontSize={13} fontWeight="600">
                            {formatFieldValue(field.field_type, val)}
                          </Text>
                        </XStack>
                      );
                    })}
                  </YStack>
                </GlassCard>
              );
            })()}

            {/* Metadata */}
            <YStack gap="$1" marginTop="$2">
              <Text color="$textMuted" fontSize={12}>
                Criado em: {formatDate(registro.created_at)} às {formatTime(registro.created_at)}
              </Text>
              <Text color="$textMuted" fontSize={12}>
                Atualizado em: {formatDate(registro.updated_at)} às{' '}
                {formatTime(registro.updated_at)}
              </Text>
            </YStack>
          </YStack>
        )}
      </ScrollView>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir registro"
        description="Tem certeza que deseja excluir este registro?"
        confirmLabel="Excluir"
        destructive
        onConfirm={doDelete}
      />
    </ScreenContainer>
  );
}

function formatFieldValue(fieldType: FieldType, value: string | number | boolean): string {
  switch (fieldType) {
    case 'checkbox':
      return value ? 'Sim' : 'Não';
    case 'rating':
      return '★'.repeat(Number(value) || 0) + '☆'.repeat(5 - (Number(value) || 0));
    default:
      return String(value);
  }
}
