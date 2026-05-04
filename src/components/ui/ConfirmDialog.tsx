import { colors } from '@/theme/tokens';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '@tamagui/alert-dialog';
import { Text, XStack, YStack } from 'tamagui';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay key="overlay" opacity={0.7} backgroundColor="rgba(0,0,0,0.7)" />
        <AlertDialogContent
          key="content"
          backgroundColor={colors.bgPrimary}
          borderRadius={16}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.1)"
          padding="$5"
          maxWidth={320}
          alignSelf="center"
        >
          <YStack gap="$3">
            <AlertDialogTitle>
              <Text color={colors.textPrimary} fontSize={18} fontWeight="700">
                {title}
              </Text>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Text color={colors.textSecondary} fontSize={14} lineHeight={20}>
                {description}
              </Text>
            </AlertDialogDescription>

            <XStack gap="$3" marginTop="$2" justifyContent="flex-end">
              <AlertDialogCancel asChild>
                <Text
                  color={colors.textSecondary}
                  fontSize={14}
                  fontWeight="600"
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  pressStyle={{ opacity: 0.7 }}
                  cursor="pointer"
                >
                  {cancelLabel}
                </Text>
              </AlertDialogCancel>

              <AlertDialogAction asChild>
                <Text
                  color={destructive ? colors.error : colors.accent}
                  fontSize={14}
                  fontWeight="700"
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  pressStyle={{ opacity: 0.7 }}
                  cursor="pointer"
                  onPress={onConfirm}
                >
                  {confirmLabel}
                </Text>
              </AlertDialogAction>
            </XStack>
          </YStack>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
