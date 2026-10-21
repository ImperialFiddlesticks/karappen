import { Pressable, StyleSheet, View } from "react-native";

import type { StudentEvent } from "@/api/events";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";
import { formatEventDate } from "@/utils/formatDate";

type Props = {
  event: StudentEvent;
  onPress?: () => void;
};

export function EventCard({ event, onPress }: Props) {
  const theme = useTheme();
  const spots = event.max_participants
    ? `${event.registered_count}/${event.max_participants} platser`
    : `${event.registered_count} anmälda`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText themeColor="accent" style={styles.date}>
        {formatEventDate(event.starts_at)}
      </ThemedText>
      <ThemedText style={styles.title}>{event.title}</ThemedText>
      <View style={styles.details}>
        <ThemedText themeColor="textSecondary">{event.location}</ThemedText>
        <ThemedText themeColor="textSecondary">{spots}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  date: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
