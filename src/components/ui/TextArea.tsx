import { styled, TextArea as TTextArea } from "tamagui";

export const TextArea = styled(TTextArea, {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: "$3",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  color: "$color",
  placeholderTextColor: "$textSecondary",
  padding: "$3",
  fontSize: "$3",
  minHeight: 120,
  focusStyle: {
    borderColor: "$accent",
  },
});
