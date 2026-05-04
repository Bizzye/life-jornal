import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { friendlyError } from '@/lib/errorMessages';
import { changePasswordSchema, type ChangePasswordInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Save } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setSaving(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Senha alterada com sucesso!');
      router.back();
    } catch (e) {
      toast.error(friendlyError(e, 'Erro ao alterar senha'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <XStack alignItems="center" gap="$2" marginBottom="$5">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="#F5F0E8" />
        </Pressable>
        <Text color="$color" fontSize={20} fontWeight="700" flex={1}>
          Alterar Senha
        </Text>
      </XStack>

      {/* Icon */}
      <YStack alignItems="center" marginBottom="$5">
        <View style={styles.iconCircle}>
          <Lock size={28} color="#E08A38" />
        </View>
        <Text color="$textSecondary" fontSize={13} textAlign="center" marginTop="$2" maxWidth={260}>
          Para sua segurança, informe a senha atual antes de definir uma nova
        </Text>
      </YStack>

      {/* Form */}
      <YStack gap="$4">
        {/* Current Password */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Senha atual
          </Text>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <XStack alignItems="center" position="relative">
                <Input
                  placeholder="Digite sua senha atual"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showCurrent}
                  flex={1}
                />
                <Pressable
                  onPress={() => setShowCurrent(!showCurrent)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  {showCurrent ? (
                    <EyeOff size={18} color="rgba(245,240,232,0.4)" />
                  ) : (
                    <Eye size={18} color="rgba(245,240,232,0.4)" />
                  )}
                </Pressable>
              </XStack>
            )}
          />
          {errors.currentPassword && (
            <Text color="$error" fontSize={12}>
              {errors.currentPassword.message}
            </Text>
          )}
        </YStack>

        {/* Divider */}
        <View style={styles.divider} />

        {/* New Password */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Nova senha
          </Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <XStack alignItems="center" position="relative">
                <Input
                  placeholder="Mínimo 6 caracteres"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showNew}
                  flex={1}
                />
                <Pressable
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  {showNew ? (
                    <EyeOff size={18} color="rgba(245,240,232,0.4)" />
                  ) : (
                    <Eye size={18} color="rgba(245,240,232,0.4)" />
                  )}
                </Pressable>
              </XStack>
            )}
          />
          {errors.newPassword && (
            <Text color="$error" fontSize={12}>
              {errors.newPassword.message}
            </Text>
          )}
        </YStack>

        {/* Confirm Password */}
        <YStack gap="$1">
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Confirmar nova senha
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <XStack alignItems="center" position="relative">
                <Input
                  placeholder="Repita a nova senha"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirm}
                  flex={1}
                />
                <Pressable
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  {showConfirm ? (
                    <EyeOff size={18} color="rgba(245,240,232,0.4)" />
                  ) : (
                    <Eye size={18} color="rgba(245,240,232,0.4)" />
                  )}
                </Pressable>
              </XStack>
            )}
          />
          {errors.confirmPassword && (
            <Text color="$error" fontSize={12}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </YStack>
      </YStack>

      {/* Save Button */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={saving || !isValid}
        style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Save size={18} color="#fff" />
            <Text color="#fff" fontSize={16} fontWeight="700">
              Salvar nova senha
            </Text>
          </>
        )}
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(224,138,56,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(224,138,56,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E08A38',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
});
