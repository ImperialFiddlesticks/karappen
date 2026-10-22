import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { createEvent, type EventInput } from "@/api/events";
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

export default function EventFormScreen() {
  const { token } = useSession();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const created = await createEvent(toEventInput(values), token);
      router.replace({
        pathname: "/event/[id]",
        params: { id: String(created.id), saved: "created" },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
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
          title={isSubmitting ? "Sparar..." : "Skapa evenemang"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 4, paddingBottom: 48 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
});
