import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useSession } from "@/context/session";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/api/client";
import { ActivityIndicator, StyleSheet } from "react-native";

type Me = { id: number; email: string; name: string; role: "member" | "admin" };

export default function ProfileScreen() {
  const { token, signOut } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Me>("/me", { token })
      .then(setMe)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) signOut();
        else setError(err.message);
      })
  }, [token]);
  return (
    <ThemedView style={styles.container}>
      <ScreenTitle>Profil</ScreenTitle>
      {error && <ThemedText themeColor="danger">{error}</ThemedText>}
      {!me && !error && <ActivityIndicator />}
      {me && (
        <>
          <ThemedText>{me.name}</ThemedText>
          <ThemedText themeColor="textSecondary">{me.email}</ThemedText>
        </>
      )}
      <Button title="Logga ut" variant="secondary" onPress={signOut} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
});
