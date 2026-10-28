import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import type { StudentEvent } from "@/api/events";
import { ThemedText } from "./ThemedText";
import { formatEventDate } from "@/utils/formatDate";
import { eventColor, eventTint } from "@/constants/theme";
import { assetUrl } from "@/api/client";

type Props = {
  readonly event: StudentEvent;
  readonly onPress?: () => void;
};

export function EventCard({ event, onPress }: Props) {
  const spots = event.max_participants
    ? `${event.registered_count}/${event.max_participants} platser`
    : `${event.registered_count} anmälda`;
  const spotsLabel = event.max_participants
    ? `${event.registered_count} av ${event.max_participants} platser bokade`
    : `${event.registered_count} anmälda`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatEventDate(event.starts_at)}, ${event.location}, ${spotsLabel}`}
      accessibilityHint="Öppnar evenemangets detaljsida"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: eventTint(event.id),
          borderColor: eventColor(event.id),
        },
        pressed && styles.pressed,
      ]}
    >
      {event.image_url && (
        <Image
          source={{ uri: assetUrl(event.image_url) }}
          contentFit="cover"
          transition={200}
          accessible={false}
          style={styles.image}
        />
      )}
      <View style={styles.content}>
        <ThemedText themeColor="accent" style={styles.date}>
          {formatEventDate(event.starts_at)}
        </ThemedText>
        <ThemedText style={styles.title}>{event.title}</ThemedText>
        <View style={styles.details}>
          <ThemedText themeColor="textSecondary">{event.location}</ThemedText>
          <ThemedText themeColor="textSecondary">{spots}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  content: {
    padding: 16,
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
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});
