import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text, YStack } from 'tamagui';

interface SubcategoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  title?: string;
}

export function SubcategoryForm({
  visible,
  onClose,
  onSubmit,
  initialName = '',
  title = 'Nova Subcategoria',
}: SubcategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError('');
    }
  }, [visible, initialName]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nome obrigatório');
      return;
    }
    if (trimmed.length > 50) {
      setError('Máximo 50 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setName('');
      setError('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
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
              <Input placeholder="Ex: Almoço, Reunião..." value={name} onChangeText={setName} />
              {error ? (
                <Text color="$error" fontSize={11}>
                  {error}
                </Text>
              ) : null}

              <Button variant="primary" onPress={handleSubmit} disabled={submitting} marginTop="$2">
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </YStack>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
