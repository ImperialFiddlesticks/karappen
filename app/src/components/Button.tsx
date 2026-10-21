import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";

type ButtonProps = {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: "primary" | "secondary";
  readonly disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    variant === "primary" ? theme.primary : theme.secondary;
  const textColor = variant === "primary" ? theme.onPrimary : theme.onSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <ThemedText style={[styles.text, { color: textColor }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  text: {
    fontWeight: "700",
  },
  dimmed: {
    opacity: 0.6,
  },
});
