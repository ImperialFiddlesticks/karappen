import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import {
  createEvent,
  type EventInput,
  fetchEvent,
  updateEvent,
  type StudentEvent,
} from "@/api/events";
import { Button } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/context/session";

type FormValues = {
  title: string;
  date: string;
  time: string;
  location: string;
  maxParticipants?: string;
  description: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  date: "",
  time: "",
  location: "",
  maxParticipants: "",
  description: "",
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/;

function toStartsAt(values: FormValues) {
  return new Date(`${values.date}T${values.time}`);
}

function validate(values: FormValues) {
  if (!values.title.trim()) return "Ange en titel";
  if (!DATE_REGEX.test(values.date)) return "Ange datum som ÅÅÅÅ-MM-DD.";
  if (!TIME_REGEX.test(values.time)) return "Ange tid som TT:MM.";
  const startsAt = toStartsAt(values);
  if (Number.isNaN(startsAt.getTime()))
    return "Datumet eller tiden finns inte.";
  if (startsAt < new Date()) return "Evenemanget måste ligga i framtiden.";
  if (!values.location.trim()) return "Ange en plats";
  if (
    values.maxParticipants &&
    !POSITIVE_INTEGER_REGEX.test(values.maxParticipants)
  ) {
    return "Max antal platser måste vara ett heltal större än 0.";
  }
  return null;
}

function toEventInput(values: FormValues): EventInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    starts_at: toStartsAt(values).toISOString(),
    location: values.location.trim(),
    max_participants: values.maxParticipants
      ? Number(values.maxParticipants)
      : null,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toFormValues(event: StudentEvent): FormValues {
  const startsAt = new Date(event.starts_at);
  return {
    title: event.title,
    date: `${startsAt.getFullYear()}-${pad(startsAt.getMonth() + 1)}-${pad(startsAt.getDate())}`,
    time: `${pad(startsAt.getHours())}:${pad(startsAt.getMinutes())}`,
    location: event.location,
    maxParticipants: event.max_participants?.toString() ?? "",
    description: event.description ?? "",
  };
}

export default function EventFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = id ? Number(id) : null;
  const isEditing = eventId !== null;
  const headerHeight = useHeaderHeight();
  const { token } = useSession();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditing);

  useEffect(() => {
    if (eventId === null) return;
    fetchEvent(eventId, token)
      .then((event) => {
        if (event) {
          setValues(toFormValues(event));
        } else {
          setError("Evenemanget hittades inte.");
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Kunde inte hämta evenemanget.",
        );
      })
      .finally(() => setIsLoadingEvent(false));
  }, [eventId, token]);

  function setField(field: keyof FormValues) {
    return (text: string) =>
      setValues((current) => ({ ...current, [field]: text }));
  }

  async function handleSubmit() {
    setError(null);

    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const input = toEventInput(values);
      if (eventId === null) {
        const created = await createEvent(input, token);
        router.replace({
          pathname: "/event/[id]",
          params: { id: String(created.id), saved: "created" },
        });
      } else {
        await updateEvent(eventId, input, token);
        router.dismissTo({
          pathname: "/event/[id]",
          params: { id: String(eventId), saved: "updated" },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSubmitting(false);
    }
  }
  if (isLoadingEvent) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator
          size="large"
          accessibilityLabel="Laddar evenemanget"
        />
      </ThemedView>
    );
  }
  const submitLabel = isEditing ? "Spara ändringar" : "Skapa evenemang";

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen
        options={{ title: isEditing ? "Ändra evenemang" : "Nytt evenemang" }}
      />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Titel"
            value={values.title}
            onChangeText={setField("title")}
            placeholder="Till exempel AW på Blues"
            returnKeyType="next"
          />
          <FormField
            label="Datum"
            value={values.date}
            onChangeText={setField("date")}
            placeholder="2026-11-06"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />

          <FormField
            label="Tid"
            value={values.time}
            onChangeText={setField("time")}
            placeholder="18:00"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />
          <FormField
            label="Plats"
            value={values.location}
            onChangeText={setField("location")}
            placeholder="Till exempel Blues"
            returnKeyType="next"
          />

          <FormField
            label="Max antal platser (valfritt)"
            value={values.maxParticipants}
            onChangeText={setField("maxParticipants")}
            placeholder="Lämna tomt för obegränsat"
            keyboardType="number-pad"
            returnKeyType="next"
          />

          <FormField
            label="Beskrivning (valfritt)"
            value={values.description}
            onChangeText={setField("description")}
            multiline
            style={styles.multiline}
          />

          {error && (
            <ThemedText themeColor="danger" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          <Button
            title={isSubmitting ? "Sparar..." : submitLabel}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 4, paddingBottom: 48 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
