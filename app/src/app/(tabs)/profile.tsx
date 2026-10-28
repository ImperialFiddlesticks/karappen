import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useSession } from "@/context/session";
import { Button } from "@/components/Button";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  fetchProfile,
  Profile,
  ProfileInput,
  updateProfile,
} from "@/api/profile";
import { useHeaderHeight } from "expo-router/build/react-navigation/index.js";
import { FormField } from "@/components/FormField";
import { Image } from "expo-image";
import { programIcon } from "@/constants/programs";

type FormValues = {
  name: string;
  program: string;
  year: string;
  dietary: string;
};

const YEAR_REGEX = /^\d{2}$/;

function toFormValues(profile: Profile): FormValues {
  return {
    name: profile.name,
    program: profile.program ?? "",
    year: profile.year != null ? String(profile.year).padStart(2, "0") : "",
    dietary: profile.dietary ?? "",
  };
}

function validate(values: FormValues) {
  if (!values.name.trim()) return "Ange ditt namn";
  if (values.year && !YEAR_REGEX.test(values.year)) {
    return "Programår måste vara två siffror, t.ex. 26";
  }
  return null;
}

function toInput(values: FormValues): ProfileInput {
  return {
    name: values.name.trim(),
    program: values.program.trim() || null,
    year: values.year ? Number(values.year) : null,
    dietary: values.dietary.trim() || null,
  };
}

export default function ProfileScreen() {
  const { token, signOut, isAdmin } = useSession();
  const headerHeight = useHeaderHeight();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [values, setValues] = useState<FormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoadError(null);
      const result = await fetchProfile(token);
      setProfile(result);
      setValues(toFormValues(result));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setLoadError(
          err instanceof Error ? err.message : "Kunde inte hämta profilen",
        );
      }
    }
  }, [token, signOut]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  function setField(field: keyof FormValues) {
    return (text: string) => {
      setSaved(false);
      setValues((current) =>
        current ? { ...current, [field]: text } : current,
      );
    };
  }

  async function handleSave() {
    if (!values) return;
    setError(null);
    setSaved(false);

    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile(toInput(values), token);
      setProfile(updated);
      setValues(toFormValues(updated));
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setError(err instanceof Error ? err.message : "Något gick fel");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText accessibilityRole="alert" style={styles.message}>
          {loadError}
        </ThemedText>
        <Button title="Försök igen" onPress={loadProfile} />
      </ThemedView>
    );
  }

  if (!profile || !values) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" accessibilityLabel="Laddar profilen" />
      </ThemedView>
    );
  }

  const icon = programIcon(profile.program);
  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenTitle>Profil</ScreenTitle>
          <ThemedText themeColor="textSecondary">{profile.email}</ThemedText>
          {icon && (
            <Image
              source={icon}
              contentFit="contain"
              accessibilityLabel={`Program: ${profile.program?.trim().toUpperCase()}`}
              style={styles.programIcon}
            />
          )}
          {isAdmin && (
            <ThemedText themeColor="accent" style={styles.badge}>
              Administratör
            </ThemedText>
          )}
          <FormField
            label="Namn"
            value={values.name}
            onChangeText={setField("name")}
            autoComplete="name"
            autoCapitalize="words"
            returnKeyType="next"
          />
          <FormField
            label="Program (valfritt)"
            value={values.program}
            onChangeText={setField("program")}
            placeholder="T.ex FMW"
            returnKeyType="next"
          />
          <FormField
            label="Programår (valfritt)"
            value={values.year}
            onChangeText={setField("year")}
            placeholder="T.ex. 26"
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="next"
          />
          <FormField
            label="Specialkost (valfritt)"
            value={values.dietary}
            onChangeText={setField("dietary")}
            placeholder="T.ex vegetarisk, glutenfri"
            multiline
            style={styles.multiline}
          />

          {error && (
            <ThemedText themeColor="danger" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          {saved && (
            <ThemedText themeColor="success" accessibilityRole="alert">
              Profilen är sparad
            </ThemedText>
          )}

          <Button
            title={isSubmitting ? "Sparar..." : "Spara profil"}
            onPress={handleSave}
            disabled={isSubmitting}
          />
          <Button title="Logga ut" variant="secondary" onPress={signOut} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 8, paddingBottom: 48 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  message: { textAlign: "center" },
  badge: { fontWeight: 100, textAlignVertical: "top" },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  programIcon: { width: 48, height: 48 },
});
