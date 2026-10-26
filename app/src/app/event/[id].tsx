import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useLocalSearchParams,
  router,
  useFocusEffect,
  Stack,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";

import {
  deleteEvent,
  fetchEvent,
  registerForEvent,
  unregisterFromEvent,
  type EventDetail,
  fetchRegistrants,
  type Registrant,
} from "@/api/events";
import { Button } from "@/components/Button";
import { ScreenTitle } from "@/components/ScreenTitle";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/use-theme";
import { formatEventDate } from "@/utils/formatDate";
import { eventColor, eventTint } from "@/constants/theme";
import { ApiError } from "@/api/client";
import { useSession } from "@/context/session";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RegistrantList } from "@/components/RegistrantList";
import { AdminMenu } from "@/components/AdminMenu";

const SAVED_MESSAGES: Record<string, string> = {
  created: "Evenemanget har skapats",
  updated: "Ändringarna har sparats",
  "created-without-image":
    "Evenemanget har skapats, men bilden kunde inte laddas upp. Försök igen via Ändra.",
  "updated-without-image":
    "Ändringarna har sparats, men bilden kunde inte laddas upp. Försök igen via Ändra.",
};

export default function EventDetailScreen() {
  const { id, saved } = useLocalSearchParams<{ id: string; saved?: string }>();
  const theme = useTheme();
  const { token, signOut, isAdmin } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const savedMessage = saved ? SAVED_MESSAGES[saved] : undefined;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregisterConfirmOpen, setIsUnregisterConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[] | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      setError(null);
      const [result, list] = await Promise.all([
        fetchEvent(Number(id), token),
        isAdmin ? fetchRegistrants(Number(id), token) : Promise.resolve(null),
      ]);
      if (result) {
        setEvent(result);
        setRegistrants(list);
      } else {
        setError("Evenemanget hittades inte.");
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
  }, [id, token, signOut, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      loadEvent().finally(() => setIsLoading(false));
    }, [loadEvent]),
  );

  async function handleRetry() {
    setIsLoading(true);
    await loadEvent();
    setIsLoading(false);
  }

  async function handleConfirmDelete() {
    if (!event) return;
    setIsConfirmOpen(false);
    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteEvent(event.id, token);
      setIsDeleted(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Kunde inte ta bort evenemanget.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function changeRegistration(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setActionError(null);
    setNotice(null);
    setIsRegistering(true);
    try {
      await action();
      setNotice(successMessage);
      await loadEvent();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Något gick fel.");
    } finally {
      setIsRegistering(false);
    }
  }

  function handleRegister() {
    if (!event) return;
    changeRegistration(
      () => registerForEvent(event.id, token),
      "Du är anmäld!",
    );
  }

  function handleConfirmUnregister() {
    if (!event) return;
    setIsUnregisterConfirmOpen(false);
    changeRegistration(
      () => unregisterFromEvent(event.id, token),
      "Du är avanmäld.",
    );
  }

  if (isDeleted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText accessibilityRole="alert" style={styles.message}>
          Evenemanget har tagits bort.
        </ThemedText>
        <Button
          title="Tillbaka till Evenemangen"
          onPress={() => router.back()}
        />
      </ThemedView>
    );
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

  const isFull =
    event.max_participants !== null &&
    event.registered_count >= event.max_participants;
  const registerLabel = isRegistering
    ? "Anmäler..."
    : isFull
      ? "Fullbokat"
      : "Anmäl mig";
  const bannerMessage = notice ?? savedMessage;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: isAdmin
            ? () => (
                <Pressable
                  onPress={() => setIsMenuOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Adminverktyg"
                  hitSlop={8}
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={theme.onHeader}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText themeColor="accent" style={styles.date}>
          {formatEventDate(event.starts_at)}
        </ThemedText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: eventTint(event.id),
              borderColor: eventColor(event.id),
            },
          ]}
        >
          <ScreenTitle>{event.title}</ScreenTitle>
          <InfoRow icon="location-outline" text={event.location} />
          <InfoRow icon="people-outline" text={spots} />
          {event.is_registered && (
            <InfoRow icon="checkmark-circle-outline" text="Du är anmäld" />
          )}
          <ThemedText style={styles.description}>
            {event.description ?? "Ingen beskrivning."}
          </ThemedText>
        </View>
        {bannerMessage && (
          <View style={styles.notice}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <ThemedText
              themeColor="textSecondary"
              accessibilityRole="alert"
              style={styles.noticeText}
            >
              {bannerMessage}
            </ThemedText>
          </View>
        )}
        {event.is_registered ? (
          <Button
            title={isRegistering ? "Avanmäler..." : "Avanmäl mig"}
            variant="secondary"
            onPress={() => setIsUnregisterConfirmOpen(true)}
            disabled={isRegistering}
          />
        ) : (
          <Button
            title={registerLabel}
            onPress={handleRegister}
            disabled={isFull || isRegistering}
          />
        )}
        {isDeleting && (
          <ThemedText themeColor="textSecondary">
            Tar bort evenemanget...
          </ThemedText>
        )}
        {actionError && (
          <ThemedText themeColor="danger" accessibilityRole="alert">
            {actionError}
          </ThemedText>
        )}
        {isAdmin && registrants && <RegistrantList registrants={registrants} />}
      </ScrollView>
      <ConfirmDialog
        visible={isConfirmOpen}
        title="Ta bort evenemang"
        message={`Vill du ta bort "${event.title}"? Alla anmälningar tas också bort`}
        confirmLabel="Ta bort"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
      <ConfirmDialog
        visible={isUnregisterConfirmOpen}
        title="Avanmäl dig"
        message={`Vill du avanmäla dig från "${event.title}"? Din plats kan gå till någon annan.`}
        confirmLabel="Avanmäl"
        onConfirm={handleConfirmUnregister}
        onCancel={() => setIsUnregisterConfirmOpen(false)}
      />
      <AdminMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={[
          {
            label: "Ändra",
            icon: "create-outline",
            onPress: () =>
              router.push({
                pathname: "/event/form",
                params: { id: String(event.id) },
              }),
          },
          {
            label: "Ta bort",
            icon: "trash-outline",
            destructive: true,
            onPress: () => setIsConfirmOpen(true),
          },
        ]}
      />
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
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  noticeText: {
    fontWeight: "700",
  },

  actions: {
    gap: 12,
    marginTop: 8,
  },
});
