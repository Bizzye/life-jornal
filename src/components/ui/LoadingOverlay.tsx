import { YStack, Spinner, Text } from "tamagui";

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.6)"
      justifyContent="center"
      alignItems="center"
      zIndex={100}
    >
      <Spinner size="large" color="$accent" />
      {message && (
        <Text color="$color" marginTop="$3" fontSize="$3">
          {message}
        </Text>
      )}
    </YStack>
  );
}
