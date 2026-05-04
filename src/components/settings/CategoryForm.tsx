import { ColorPicker } from '@/components/settings/ColorPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { categorySchema, type CategoryInput } from '@/schemas/category.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, View } from 'react-native';
import { Text, YStack } from 'tamagui';

interface CategoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryInput) => Promise<void>;
  initialValues?: CategoryInput;
  title?: string;
}

export function CategoryForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
  title = 'Nova Categoria',
}: CategoryFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues ?? { name: '', color: '#E08A38' },
  });

  useEffect(() => {
    if (visible) {
      reset(initialValues ?? { name: '', color: '#E08A38' });
    }
  }, [visible, initialValues, reset]);

  const handleFormSubmit = async (data: CategoryInput) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
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
            }}
          >
            <Text color="#F5F0E8" fontSize={18} fontWeight="700" marginBottom="$4">
              {title}
            </Text>

            <YStack gap="$3">
              <Text color="#F5F0E8" fontSize={14} fontWeight="500">
                Nome
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    placeholder="Ex: Trabalho, Saúde, Lazer..."
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

              <Text color="#F5F0E8" fontSize={14} fontWeight="500">
                Cor
              </Text>
              <Controller
                control={control}
                name="color"
                render={({ field: { value, onChange } }) => (
                  <ColorPicker value={value} onChange={onChange} />
                )}
              />
              {errors.color && (
                <Text color="$error" fontSize={11}>
                  {errors.color.message}
                </Text>
              )}

              <Button
                variant="primary"
                onPress={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
                marginTop="$2"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </YStack>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
