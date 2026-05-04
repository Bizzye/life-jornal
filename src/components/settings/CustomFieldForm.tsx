import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { customFieldSchema, type CustomFieldInput } from '@/schemas/category.schema';
import type { CategoryCustomField, FieldType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const FIELD_TYPE_OPTIONS = [
  { label: 'Texto curto', value: 'text' },
  { label: 'Texto longo', value: 'textarea' },
  { label: 'Número', value: 'number' },
  { label: 'Checkbox (sim/não)', value: 'checkbox' },
  { label: 'Seleção', value: 'select' },
  { label: 'Avaliação (1-5)', value: 'rating' },
];

interface CustomFieldFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CustomFieldInput) => Promise<void>;
  categoryId: string;
  initialValues?: CategoryCustomField;
  title?: string;
}

export function CustomFieldForm({
  visible,
  onClose,
  onSubmit,
  categoryId,
  initialValues,
  title = 'Novo Campo',
}: CustomFieldFormProps) {
  const [options, setOptions] = useState<string[]>(initialValues?.options ?? []);
  const [newOption, setNewOption] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomFieldInput>({
    resolver: zodResolver(customFieldSchema) as any,
    defaultValues: {
      name: initialValues?.name ?? '',
      field_type: initialValues?.field_type ?? 'text',
      options: initialValues?.options ?? [],
      category_id: categoryId,
    },
  });

  const fieldType = watch('field_type') as FieldType;

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions((prev) => [...prev, trimmed]);
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: CustomFieldInput) => {
    await onSubmit({ ...data, options: fieldType === 'select' ? options : [] });
    reset();
    setOptions([]);
    setNewOption('');
    onClose();
  };

  const handleClose = () => {
    reset();
    setOptions([]);
    setNewOption('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'flex-end',
        }}
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: '#1A1E1A',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
              borderBottomWidth: 0,
              padding: 20,
              paddingBottom: 32,
              maxHeight: '80%',
            }}
          >
            <Text color="#F5F0E8" fontSize={18} fontWeight="700" marginBottom="$4">
              {title}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$3">
                {/* Name */}
                <Text color="#F5F0E8" fontSize={14} fontWeight="500">
                  Nome do campo
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      placeholder="Ex: Local, Calorias, Humor..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.name && (
                  <Text color="$error" fontSize={11}>
                    {errors.name.message}
                  </Text>
                )}

                {/* Type */}
                <Text color="#F5F0E8" fontSize={14} fontWeight="500">
                  Tipo
                </Text>
                <Controller
                  control={control}
                  name="field_type"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value}
                      onValueChange={onChange}
                      placeholder="Selecione o tipo"
                      options={FIELD_TYPE_OPTIONS}
                    />
                  )}
                />
                {errors.field_type && (
                  <Text color="$error" fontSize={11}>
                    {errors.field_type.message}
                  </Text>
                )}

                {/* Options (only for select type) */}
                {fieldType === 'select' && (
                  <YStack gap="$2">
                    <Text color="#F5F0E8" fontSize={14} fontWeight="500">
                      Opções
                    </Text>

                    {options.map((opt, i) => (
                      <XStack
                        key={`${opt}-${i}`}
                        alignItems="center"
                        gap="$2"
                        backgroundColor="rgba(255,255,255,0.06)"
                        borderRadius={8}
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                      >
                        <Text color="rgba(245,240,232,0.8)" fontSize={14} flex={1}>
                          {opt}
                        </Text>
                        <Pressable onPress={() => handleRemoveOption(i)} hitSlop={8}>
                          <Trash2 size={14} color="#EF4444" />
                        </Pressable>
                      </XStack>
                    ))}

                    <XStack gap="$2" alignItems="center">
                      <View style={{ flex: 1 }}>
                        <Input
                          placeholder="Nova opção..."
                          value={newOption}
                          onChangeText={setNewOption}
                          onSubmitEditing={handleAddOption}
                        />
                      </View>
                      <Pressable
                        onPress={handleAddOption}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: 'rgba(224,138,56,0.15)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Plus size={20} color="#E08A38" />
                      </Pressable>
                    </XStack>

                    {options.length === 0 && (
                      <Text color="rgba(245,240,232,0.35)" fontSize={12}>
                        Adicione pelo menos uma opção para campos de seleção
                      </Text>
                    )}
                  </YStack>
                )}

                <Button
                  variant="primary"
                  onPress={handleSubmit(handleFormSubmit as any)}
                  disabled={isSubmitting}
                  marginTop="$2"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </YStack>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
