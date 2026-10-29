import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";

type ButtonProps = {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: "primary" | "secondary" | "danger";
  readonly disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  const colors = {
    primary: { background: theme.primary, text: theme.onPrimary },
    secondary: { background: theme.secondary, text: theme.onSecondary },
    danger: { background: theme.danger, text: theme.onDanger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <ThemedText style={[styles.text, { color: colors.text }]}>
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
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
  },
  text: {
    fontWeight: "700",
  },
  dimmed: {
    opacity: 0.6,
  },
});
