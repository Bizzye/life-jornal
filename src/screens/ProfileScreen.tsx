import { Text } from "tamagui";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm("Deseja realmente sair?")) {
      logout();
    }
  };

  return (
    <ScreenContainer>
      <Text color="$color" fontSize="$6" fontWeight="700" marginBottom="$4">
        Perfil 👤
      </Text>

      <GlassCard elevated marginBottom="$4">
        <Text color="$color" fontSize="$4" fontWeight="600">
          {user?.name}
        </Text>
        <Text color="$textSecondary" fontSize="$2" marginTop="$1">
          {user?.email}
        </Text>
      </GlassCard>

      <Button variant="secondary" onPress={handleLogout}>
        Sair da conta
      </Button>
    </ScreenContainer>
  );
}
