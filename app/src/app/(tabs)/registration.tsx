import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";

export default function RegistrationsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ScreenTitle>Anmälningar</ScreenTitle>
      <ThemedText>Här kommer dina anmälningar</ThemedText>
    </ThemedView>
  );
}
