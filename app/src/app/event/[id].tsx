import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { fetchEvent, fetchEvents, type StudentEvent } from "@/api/events";
import { Button } from "@/components/Button";
import { ScreenTitle } from "@/components/ScreenTitle";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/use-theme";
import { formatEventDate } from "@/utils/formatDate";
import { eventColor } from "@/constants/theme";
import { ApiError } from "@/api/client";
import { useSession } from "@/context/session";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { token, signOut } = useSession();
  const [event, setEvent] = useState<StudentEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchEvent(Number(id), token);
      if (result) {
        setEvent(result);
      } else {
        setError("Evenemanger hittades inte.");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Kunde inte hämta evenemanget.",
        );
      }
    }
  }, [id, token, signOut]);

  useEffect(() => {
    loadEvent().finally(() => setIsLoading(false));
  }, [loadEvent]);

  async function handleRetry() {
    setIsLoading(true);
    await loadEvent();
    setIsLoading(false);
  }
  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={theme.accent}
          accessibilityLabel="Laddar evenemanget"
        />
      </ThemedView>
    );
  }
  if (error || !event) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText accessibilityRole="alert" style={styles.message}>
          {error}
        </ThemedText>
        <Button title="Försök igen" onPress={handleRetry} />
      </ThemedView>
    );
  }

  const spots = event.max_participants
    ? `${event.registered_count} av ${event.max_participants} platser bokade`
    : `${event.registered_count} anmälda`;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText themeColor="accent" style={styles.date}>
          {formatEventDate(event.starts_at)}
        </ThemedText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: eventColor(event.id),
            },
          ]}
        >
          <ScreenTitle>{event.title}</ScreenTitle>
          <InfoRow icon="location-outline" text={event.location} />
          <InfoRow icon="people-outline" text={spots} />
          <ThemedText style={styles.description}>
            {event.description ?? "Ingen beskrivning."}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

type InfoRowProps = {
  readonly icon: React.ComponentProps<typeof Ionicons>["name"];
  readonly text: string;
};

function InfoRow({ icon, text }: InfoRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <ThemedText themeColor="textSecondary">{text}</ThemedText>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
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
  date: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  description: {
    lineHeight: 24,
    marginTop: 8,
  },
});
