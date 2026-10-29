import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export function FormCard({ children }: PropsWithChildren) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: `${theme.card}D9`,
          borderColor: theme.secondary,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    padding: 24,
    gap: 8,
  },
});
