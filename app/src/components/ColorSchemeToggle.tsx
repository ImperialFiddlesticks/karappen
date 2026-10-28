import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import { useColorSchemePreference } from "@/context/color-scheme";
import { useTheme } from "@/hooks/use-theme";

export function ColorSchemeToggle() {
  const theme = useTheme();
  const { colorScheme, toggleColorScheme } = useColorSchemePreference();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={toggleColorScheme}
      accessibilityRole="switch"
      accessibilityLabel="Mörkt läge"
      accessibilityState={{ checked: isDark }}
      hitSlop={8}
      style={{ marginLeft: 16 }}
    >
      <Ionicons
        name={isDark ? "moon-outline" : "sunny-outline"}
        size={24}
        color={theme.onHeader}
      />
    </Pressable>
  );
}
