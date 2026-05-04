import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { entryService } from '@/services/entry.service';
import { useCategoryStore } from '@/stores/category.store';
import { useRouter } from 'expo-router';
import { ChevronRight, FolderOpen, LogOut, ShieldCheck, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const categoryCount = useCategoryStore((s) => s.categories.length);

  useEffect(() => {
    if (user?.id) {
      entryService.count(user.id).then(setEntryCount);
    }
  }, [user?.id]);

  const handleLogout = () => setLogoutOpen(true);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar + Info */}
        <YStack alignItems="center" paddingVertical="$5" gap="$2">
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <Text color="$color" fontSize={22} fontWeight="700" marginTop="$2">
            {user?.name}
          </Text>
          <Text color="$textSecondary" fontSize={14}>
            {user?.email}
          </Text>
        </YStack>

        {/* Stats */}
        <XStack justifyContent="center" gap="$5" paddingVertical="$3" marginBottom="$4">
          <YStack alignItems="center">
            <Text color="$accent" fontSize={20} fontWeight="700">
              {entryCount ?? '–'}
            </Text>
            <Text color="$textMuted" fontSize={12}>
              registros
            </Text>
          </YStack>
          <View style={styles.statDivider} />
          <YStack alignItems="center">
            <Text color="$accent" fontSize={20} fontWeight="700">
              {categoryCount}
            </Text>
            <Text color="$textMuted" fontSize={12}>
              categorias
            </Text>
          </YStack>
        </XStack>

        {/* Sections */}
        <YStack gap="$3">
          {/* Account section */}
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
            marginBottom={-4}
          >
            Conta
          </Text>
          <YStack style={styles.section}>
            <MenuItem
              icon={<User size={18} color="#E08A38" />}
              label="Editar Perfil"
              onPress={() => router.push('/edit-profile' as any)}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<ShieldCheck size={18} color="#E08A38" />}
              label="Alterar Senha"
              onPress={() => router.push('/change-password' as any)}
            />
          </YStack>

          {/* Settings section */}
          <Text
            color="$textMuted"
            fontSize={12}
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={1}
            marginTop="$2"
            marginBottom={-4}
          >
            Configurações
          </Text>
          <YStack style={styles.section}>
            <MenuItem
              icon={<FolderOpen size={18} color="#E08A38" />}
              label="Gerenciar Categorias"
              subtitle={`${categoryCount} categorias`}
              onPress={() => router.push('/categories' as any)}
            />
          </YStack>

          {/* Logout */}
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color="#EF4444" />
            <Text color="#EF4444" fontSize={15} fontWeight="600">
              Sair da conta
            </Text>
          </Pressable>
        </YStack>

        <Text color="$textMuted" fontSize={11} textAlign="center" marginTop="$5" marginBottom="$3">
          Life Journal v1.0.0
        </Text>
      </ScrollView>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sair da conta"
        description="Deseja realmente sair?"
        confirmLabel="Sair"
        onConfirm={logout}
      />
    </ScreenContainer>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuIcon}>{icon}</View>
      <YStack flex={1}>
        <Text color="#F5F0E8" fontSize={15} fontWeight="500">
          {label}
        </Text>
        {subtitle && (
          <Text color="rgba(245,240,232,0.4)" fontSize={12}>
            {subtitle}
          </Text>
        )}
      </YStack>
      <ChevronRight size={16} color="rgba(245,240,232,0.3)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(224,138,56,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(224,138,56,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E08A38',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(224,138,56,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 64,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    marginTop: 8,
  },
});
