import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useImagePicker } from '@/hooks/useImagePicker';
import { friendlyError } from '@/lib/errorMessages';
import { profileSchema, type ProfileInput } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { ChevronLeft, Pencil, Save } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const { pickAndUpload, uploading } = useImagePicker();
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      birthday: user?.birthday ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
  });

  const avatarUrl = watch('avatar_url');
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  const handlePickAvatar = async () => {
    const url = await pickAndUpload();
    if (url) {
      setValue('avatar_url', url, { shouldDirty: true });
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      await updateProfile(data);
      router.back();
    } catch (e) {
      toast.error(friendlyError(e, 'Erro ao salvar perfil'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <XStack alignItems="center" gap="$2" marginBottom="$4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="#F5F0E8" />
        </Pressable>
        <Text color="$color" fontSize={20} fontWeight="700" flex={1}>
          Editar Perfil
        </Text>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={saving || !isDirty}
          hitSlop={8}
          style={[styles.saveButton, (!isDirty || saving) && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Save size={16} color="#fff" />
              <Text color="#fff" fontSize={14} fontWeight="600">
                Salvar
              </Text>
            </>
          )}
        </Pressable>
      </XStack>

      {/* Avatar */}
      <YStack alignItems="center" marginBottom="$5">
        <Pressable onPress={handlePickAvatar} disabled={uploading}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
        </Pressable>
        <XStack alignItems="center" gap="$1.5" marginTop="$2">
          <Pencil size={12} color="rgba(245,240,232,0.4)" />
          <Text color="$textMuted" fontSize={12}>
            Alterar foto
          </Text>
        </XStack>
      </YStack>

      {/* Form */}
      <YStack gap="$4">
        {/* Name */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Nome
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input placeholder="Seu nome" value={value} onChangeText={onChange} />
            )}
          />
          {errors.name && (
            <Text color="$error" fontSize={12}>
              {errors.name.message}
            </Text>
          )}
        </YStack>

        {/* Email (read-only) */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Email
          </Text>
          <View style={styles.readOnlyField}>
            <Text color="rgba(245,240,232,0.4)" fontSize={16}>
              {user?.email}
            </Text>
          </View>
          <Text color="$textMuted" fontSize={11}>
            O email não pode ser alterado
          </Text>
        </YStack>

        {/* Birthday */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Data de nascimento
          </Text>
          <Controller
            control={control}
            name="birthday"
            render={({ field: { onChange, value } }) => (
              <DateInput value={value ?? ''} onChange={onChange} placeholder="Selecione a data" />
            )}
          />
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E08A38',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(224,138,56,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(224,138,56,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '700',
    color: '#E08A38',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readOnlyField: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
