import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";

export default function ProfileScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ScreenTitle>Profil</ScreenTitle>
      <ThemedText>Här kommer profilen</ThemedText>
    </ThemedView>
  );
}
