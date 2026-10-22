import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { fetchEvents, type StudentEvent } from "@/api/events";
import { Button } from "@/components/Button";
import { EventCard } from "@/components/EventCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import { ApiError } from "@/api/client";
import { useSession } from "@/context/session";

export default function EventsScreen() {
  const theme = useTheme();
  const { token, signOut } = useSession();
  const [events, setEvents] = useState<StudentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      setEvents(await fetchEvents(token));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Kunde inte hämta evenemangen",
        );
      }
    }
  }, [token, signOut]);

  useEffect(() => {
    loadEvents().finally(() => setIsLoading(false));
  }, [loadEvents]);

  async function handleRetry() {
    setIsLoading(true);
    await loadEvents();
    setIsLoading(false);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={theme.accent}
          accessibilityLabel="Laddar evenemang"
        />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.message} accessibilityRole="alert">
          {error}
        </ThemedText>
        <Button title="Försök igen" onPress={handleRetry} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(event) => String(event.id)}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() =>
              router.push({
                pathname: "/event/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
        ListHeaderComponent={<ScreenTitle>Evenemang</ScreenTitle>}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Inga kommande evenemang just nu.
          </ThemedText>
        }
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  message: {
    textAlign: "center",
  },
});
