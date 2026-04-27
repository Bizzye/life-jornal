import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "@/theme/tokens";

interface FABProps {
  onPress: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
}

export function FAB({ onPress, icon = "plus" }: FABProps) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <FontAwesome name={icon} size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
