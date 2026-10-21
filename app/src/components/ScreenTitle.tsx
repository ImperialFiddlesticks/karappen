import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

export function ScreenTitle({ children }: { readonly children: string }) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    marginBottom: 16,
  },
});
