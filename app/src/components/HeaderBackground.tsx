import { View } from "react-native";
import { RainbowStripe } from "./RainbowStripe";
import { useTheme } from "@/hooks/use-theme";

export function HeaderBackground() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.header,
        justifyContent: "flex-end",
      }}
    >
      <RainbowStripe />
    </View>
  );
}
