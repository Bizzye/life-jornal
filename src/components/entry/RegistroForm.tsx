import { CustomFieldRenderer } from '@/components/entry/CustomFieldRenderer';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { TimeInput } from '@/components/ui/TimeInput';
import { useImagePicker } from '@/hooks/useImagePicker';
import { nowTime, todayISO } from '@/lib/utils';
import { entrySchema, type EntryInput } from '@/schemas/entry.schema';
import { useCategoryStore } from '@/stores/category.store';
import type { CustomFieldValues, Registro } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface RegistroFormProps {
  /** Existing registro for edit mode. Omit for create mode. */
  registro?: Registro;
  onSubmit: (data: EntryInput) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export function RegistroForm({ registro, onSubmit, loading, submitLabel }: RegistroFormProps) {
  const { pickAndUpload, uploading } = useImagePicker();
  const categories = useCategoryStore((s) => s.categories);

  const [photoUrls, setPhotoUrls] = useState<string[]>(registro?.photo_urls ?? []);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValues>(
    registro?.custom_field_values ?? {},
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
        icon: (
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: cat.color,
            }}
          />
        ),
      })),
    [categories],
  );

  const defaultEventTime = registro?.event_date
    ? new Date(registro.event_date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : nowTime();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      category_id: registro?.category_id ?? categories[0]?.id ?? '',
      subcategory_id: registro?.subcategory_id ?? undefined,
      title: registro?.title ?? '',
      body: registro?.body ?? '',
      event_date: registro?.event_date?.split('T')[0] ?? todayISO(),
      event_time: defaultEventTime,
    },
  });

  const selectedCategoryId = watch('category_id');
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subcategoryOptions = useMemo(
    () =>
      selectedCategory?.subcategories.map((sub) => ({
        label: sub.name,
        value: sub.id,
      })) ?? [],
    [selectedCategory],
  );

  const customFields = selectedCategory?.custom_fields ?? [];

  // Reset custom field values when category changes (keep values for same category in edit mode)
  const prevCategoryIdRef = useState(selectedCategoryId)[0];
  useEffect(() => {
    if (selectedCategoryId !== prevCategoryIdRef && !registro) {
      setCustomFieldValues({});
    }
  }, [selectedCategoryId]);

  const handlePickImage = async () => {
    if (photoUrls.length >= 3) return;
    const url = await pickAndUpload();
    if (url) setPhotoUrls((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: EntryInput) => {
    await onSubmit({ ...data, photo_urls: photoUrls, custom_field_values: customFieldValues });
    if (!registro) {
      reset();
      setPhotoUrls([]);
      setCustomFieldValues({});
    }
  };

  const isSubmitting = loading || uploading;
  const title = watch('title');
  const canSubmit = !isSubmitting && !!title?.trim();

  return (
    <YStack gap="$4">
      {/* Photos — always on top like the detail edit screen */}
      {photoUrls.length > 0 && (
        <ImageCarousel images={photoUrls} editable onRemove={handleRemoveImage} />
      )}
      {photoUrls.length < 3 && (
        <Button variant="secondary" onPress={handlePickImage} disabled={uploading}>
          {uploading ? 'Enviando...' : 'Adicionar foto'}
        </Button>
      )}

      {/* Category */}
      <Controller
        control={control}
        name="category_id"
        render={({ field: { value, onChange } }) => (
          <Select
            value={value}
            onValueChange={(v) => {
              onChange(v);
              setValue('subcategory_id', undefined);
            }}
            placeholder="Selecione a categoria"
            options={categoryOptions}
          />
        )}
      />
      {errors.category_id && (
        <Text color="$error" fontSize="$1">
          {errors.category_id.message}
        </Text>
      )}

      {/* Subcategory */}
      {subcategoryOptions.length > 0 && (
        <Controller
          control={control}
          name="subcategory_id"
          render={({ field: { value, onChange } }) => (
            <Select
              value={value ?? ''}
              onValueChange={onChange}
              placeholder="Subcategoria (opcional)"
              options={subcategoryOptions}
            />
          )}
        />
      )}

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input placeholder="Título" value={value} onChangeText={onChange} onBlur={onBlur} />
        )}
      />
      {errors.title && (
        <Text color="$error" fontSize="$1">
          {errors.title.message}
        </Text>
      )}

      {/* Date & Time — side by side */}
      <XStack gap="$3">
        <YStack flex={1}>
          <Controller
            control={control}
            name="event_date"
            render={({ field: { value, onChange } }) => (
              <DateInput value={value} onChange={onChange} />
            )}
          />
        </YStack>
        <YStack flex={1}>
          <Controller
            control={control}
            name="event_time"
            render={({ field: { value, onChange } }) => (
              <TimeInput value={value} onChange={onChange} />
            )}
          />
        </YStack>
      </XStack>

      {/* Body */}
      <Controller
        control={control}
        name="body"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextArea
            placeholder="Descrição (opcional)"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {/* Custom fields */}
      {customFields.length > 0 && (
        <YStack gap="$3" paddingTop="$2" borderTopWidth={1} borderTopColor="rgba(255,255,255,0.06)">
          <Text
            color="rgba(245,240,232,0.5)"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Campos adicionais
          </Text>
          {customFields.map((field) => (
            <CustomFieldRenderer
              key={field.id}
              field={field}
              value={customFieldValues[field.id]}
              onChange={(v) => setCustomFieldValues((prev) => ({ ...prev, [field.id]: v }))}
            />
          ))}
        </YStack>
      )}

      {/* Submit */}
      <Button onPress={handleSubmit(handleFormSubmit)} disabled={!canSubmit}>
        {isSubmitting
          ? 'Salvando...'
          : (submitLabel ?? (registro ? 'Salvar alterações' : 'Salvar Registro'))}
      </Button>
    </YStack>
  );
}
