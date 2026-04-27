import { XStack, Text } from "tamagui";
import { getGreeting } from "@/lib/utils";

interface HeaderProps {
  name: string;
}

export function Header({ name }: HeaderProps) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      marginBottom="$4"
    >
      <Text color="$color" fontSize="$6" fontWeight="700">
        {getGreeting()}, {name} 👋
      </Text>
    </XStack>
  );
}
