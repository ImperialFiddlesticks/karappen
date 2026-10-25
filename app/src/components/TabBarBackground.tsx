import { View } from "react-native";
import { RainbowStripe } from "./RainbowStripe";
import { useTheme } from "@/hooks/use-theme";

export function TabBarBackground() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.header }}>
      <RainbowStripe />
    </View>
  );
}
