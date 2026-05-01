import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { GlassCard } from '@/components/ui/GlassCard';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { TimeInput } from '@/components/ui/TimeInput';
import { useImagePicker } from '@/hooks/useImagePicker';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { formatDate, formatTime, getCategoryColor } from '@/lib/utils';
import { entryService } from '@/services/entry.service';
import { useEntryStore } from '@/stores/entry.store';
import { colors } from '@/theme/tokens';
import type { Category } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Clock, Pencil, Trash2 } from 'lucide-react-native';
import { createElement, useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';

const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
  label: cfg.label,
  value: key,
}));

export function RegistroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const entries = useEntryStore((s) => s.entries);
  const updateEntry = useEntryStore((s) => s.updateEntry);
  const removeEntry = useEntryStore((s) => s.removeEntry);
  const { pickAndUpload, uploading } = useImagePicker();

  const registro = entries.find((e) => e.id === id);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [category, setCategory] = useState<Category>(registro?.category ?? 'event');
  const [title, setTitle] = useState(registro?.title ?? '');
  const [body, setBody] = useState(registro?.body ?? '');
  const [eventDate, setEventDate] = useState(registro?.event_date?.split('T')[0] ?? '');
  const [eventTime, setEventTime] = useState(
    registro?.event_date
      ? new Date(registro.event_date).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '00:00',
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(registro?.photo_urls ?? []);

  if (!registro) {
    return (
      <ScreenContainer>
        <Text color="$textPrimary" fontSize={18}>
          Registro não encontrado
        </Text>
      </ScreenContainer>
    );
  }

  const config = CATEGORY_CONFIG[registro.category];
  const categoryColor = getCategoryColor(registro.category);

  const startEdit = () => {
    setCategory(registro.category);
    setTitle(registro.title);
    setBody(registro.body ?? '');
    setEventDate(registro.event_date.split('T')[0]);
    setEventTime(
      new Date(registro.event_date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
    setPhotoUrls(registro.photo_urls ?? []);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await entryService.update(id, {
        category,
        title,
        body: body || undefined,
        event_date: eventDate,
        event_time: eventTime,
        photo_urls: photoUrls,
      });
      updateEntry(id, updated);
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    const doDelete = async () => {
      try {
        await entryService.remove(id);
        removeEntry(id);
        router.back();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao excluir';
        if (Platform.OS === 'web') {
          alert(msg);
        } else {
          Alert.alert('Erro', msg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Tem certeza que deseja excluir este registro?')) {
        doDelete();
      }
    } else {
      Alert.alert('Excluir registro', 'Tem certeza que deseja excluir este registro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleAddPhoto = async () => {
    const url = await pickAndUpload();
    if (url) {
      setPhotoUrls((prev) => [...prev, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

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
              onPress={editing ? cancelEdit : startEdit}
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
          /* ====== EDIT MODE ====== */
          <YStack gap="$4">
            {/* Photos */}
            {photoUrls.length > 0 && (
              <ImageCarousel
                images={photoUrls}
                onRemove={handleRemovePhoto}
                editable
                aspectRatio={16 / 9}
              />
            )}
            {photoUrls.length < 3 && (
              <Button onPress={handleAddPhoto} disabled={uploading} variant="secondary">
                {uploading ? 'Enviando...' : 'Adicionar foto'}
              </Button>
            )}

            {/* Category */}
            <Select
              options={categoryOptions}
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
              placeholder="Categoria"
            />

            {/* Title */}
            <Input value={title} onChangeText={setTitle} placeholder="Título" />

            {/* Date & Time */}
            <XStack gap="$3">
              <YStack flex={1}>
                <DateInput value={eventDate} onChange={setEventDate} />
              </YStack>
              <YStack flex={1}>
                <TimeInput value={eventTime} onChange={setEventTime} />
              </YStack>
            </XStack>

            {/* Body */}
            <TextArea value={body} onChangeText={setBody} placeholder="Descrição (opcional)" />

            {/* Save */}
            <Button onPress={handleSave} disabled={saving || !title.trim()}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </YStack>
        ) : (
          /* ====== VIEW MODE ====== */
          <YStack gap="$4">
            {/* Photos */}
            {registro.photo_urls?.length > 0 && (
              <ImageCarousel images={registro.photo_urls} aspectRatio={16 / 9} />
            )}

            {/* Category badge */}
            <XStack alignItems="center" gap="$2">
              <View
                backgroundColor={categoryColor}
                borderRadius={12}
                padding="$1"
                paddingHorizontal="$2"
              >
                <XStack alignItems="center" gap="$1">
                  {createElement(config.icon, { size: 14, color: '#fff' })}
                  <Text color="#fff" fontSize={12} fontWeight="600">
                    {config.label}
                  </Text>
                </XStack>
              </View>
            </XStack>

            {/* Title */}
            <Text color="$textPrimary" fontSize={24} fontWeight="800" lineHeight={30}>
              {registro.title}
            </Text>

            {/* Date/Time card */}
            <GlassCard>
              <XStack alignItems="center" gap="$3" padding="$3">
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
              <GlassCard>
                <YStack padding="$3">
                  <Text color="$textPrimary" fontSize={14} lineHeight={22}>
                    {registro.body}
                  </Text>
                </YStack>
              </GlassCard>
            )}

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
    </ScreenContainer>
  );
}
