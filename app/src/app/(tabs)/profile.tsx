import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useSession } from "@/context/session";
import { Button } from "@/components/Button";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ApiError } from "@/api/client";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  fetchProfile,
  Profile,
  ProfileInput,
  updateProfile,
  uploadAvatar,
} from "@/api/profile";
import { useHeaderHeight } from "expo-router/build/react-navigation/index.js";
import { FormField } from "@/components/FormField";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { ProfileRow } from "@/components/ProfileRow";
import { YearPicker } from "@/components/YearPicker";
import * as ImagePicker from "expo-image-picker";
import { ProfileCard } from "@/components/ProfileCard";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type FormValues = {
  name: string;
  program: string;
  year: number | null;
  dietary: string;
};

function getProgramYears(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear() % 100;

  const firstYears = month >= 8 ? year : year - 1;
  const secondYears = firstYears - 1;

  return [secondYears, firstYears];
}

function toFormValues(profile: Profile): FormValues {
  return {
    name: profile.name,
    program: profile.program ?? "",
    year: profile.year,
    dietary: profile.dietary ?? "",
  };
}

function validate(values: FormValues) {
  if (!values.name.trim()) return "Ange ditt namn";
  return null;
}

function toInput(values: FormValues): ProfileInput {
  return {
    name: values.name.trim(),
    program: values.program.trim().toUpperCase() || null,
    year: values.year,
    dietary: values.dietary.trim() || null,
  };
}

export default function ProfileScreen() {
  const { token, signOut, isAdmin } = useSession();
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [values, setValues] = useState<FormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  function setField(field: Exclude<keyof FormValues, "year">) {
    return (text: string) => {
      setValues((current) =>
        current ? { ...current, [field]: text } : current,
      );
    };
  }

  function setYear(year: number | null) {
    setValues((current) => (current ? { ...current, year } : current));
  }

  function handleRetry() {
    setLoadError(null);
    loadProfile();
  }

  function handleEdit() {
    if (!profile) return;
    setValues(toFormValues(profile));
    setError(null);
    setSaved(false);
    setIsEditing(true);
  }

  function handleCancel() {
    if (profile) setValues(toFormValues(profile));
    setError(null);
    setIsEditing(false);
  }

  async function handlePickAvatar() {
    setAvatarError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const picked = result.assets[0];
    if (picked.fileSize && picked.fileSize > MAX_IMAGE_BYTES) {
      setAvatarError("Bilden får vara högst 5 MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(picked, token);
      setProfile(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setAvatarError(
          err instanceof Error ? err.message : "Kunde inte ladda upp bilden",
        );
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!values) return;
    setError(null);

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
      setIsEditing(false);
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
        <Button title="Försök igen" onPress={handleRetry} />
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
          <View style={styles.header}>
            <ScreenTitle>
              {isEditing ? "Redigera profil" : "Profil"}
            </ScreenTitle>
            {!isEditing && (
              <Pressable
                onPress={handleEdit}
                accessibilityRole="button"
                accessibilityLabel="Redigera profil"
                hitSlop={8}
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.dimmed,
                ]}
              >
                <Ionicons name="pencil" size={20} color={theme.text} />
              </Pressable>
            )}
          </View>

          {isEditing ? (
            <>
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
                autoCapitalize="characters"
                returnKeyType="next"
              />
              <YearPicker
                options={getProgramYears()}
                value={values.year}
                onChange={setYear}
              />
              <FormField
                label="Specialkost (valfritt)"
                value={values.dietary}
                onChangeText={setField("dietary")}
                placeholder="T.ex vegetarisk, glutenfri"
                autoCapitalize="sentences"
                multiline
                style={styles.multiline}
              />

              {error && (
                <ThemedText themeColor="danger" accessibilityRole="alert">
                  {error}
                </ThemedText>
              )}

              <Button
                title={isSubmitting ? "Sparar..." : "Spara profil"}
                onPress={handleSave}
                disabled={isSubmitting}
              />
              <Button
                title="Avbryt"
                variant="secondary"
                onPress={handleCancel}
                disabled={isSubmitting}
              />
            </>
          ) : (
            <>
              <ProfileCard
                profile={profile}
                isAdmin={isAdmin}
                onPressAvatar={handlePickAvatar}
                isUploadingAvatar={isUploadingAvatar}
              />

              {avatarError && (
                <ThemedText themeColor="danger" accessibilityRole="alert">
                  {avatarError}
                </ThemedText>
              )}

              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <ProfileRow label="E-post" value={profile.email} />
                <ProfileRow label="Specialkost" value={profile.dietary} />
              </View>

              {saved && (
                <ThemedText themeColor="success" accessibilityRole="alert">
                  Profilen är sparad
                </ThemedText>
              )}

              <Button title="Logga ut" variant="secondary" onPress={signOut} />
            </>
          )}
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
  multiline: { minHeight: 100, textAlignVertical: "top" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: { opacity: 0.6 },
  card: { borderRadius: 16, padding: 16, gap: 12, marginBottom: 8 },
});
