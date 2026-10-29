import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { RainbowStripe } from "@/components/RainbowStripe";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/context/session";
import { DecorativeShapes } from "@/components/DecorativeShapes";
import { FormCard } from "@/components/FormCard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validate(name: string, email: string, password: string) {
  if (!name.trim()) return "Ange ditt namn";
  if (!EMAIL_REGEX.test(email.trim())) return "Ange en giltig e-postadress";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken`;
  }
  return null;
}

export default function SignInScreen() {
  const { signUp } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    const validationError = validate(name, email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <DecorativeShapes />
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <FormCard>
              <ThemedText type="subtitle" style={styles.title}>
                Chas Academy Studentkår
              </ThemedText>

              <FormField
                label="Namn"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                autoCapitalize="words"
                placeholder="För- och efternamn"
                returnKeyType="next"
              />
              <FormField
                label="E-post"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="namn@chasacademy.se"
                returnKeyType="next"
              />
              <FormField
                label="Lösenord"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                placeholder={`Minst ${MIN_PASSWORD_LENGTH} tecken`}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {error && (
                <ThemedText themeColor="danger" accessibilityRole="alert">
                  {error}
                </ThemedText>
              )}

              <Button
                title={isSubmitting ? "Skapar konto..." : "Skapa konto"}
                onPress={handleSubmit}
                disabled={isSubmitting}
              />

              <Link href="/sign-in" style={styles.link}>
                <ThemedText themeColor="accent">
                  Har du redan ett konto? Logga in
                </ThemedText>
              </Link>
            </FormCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { textAlign: "center", marginBottom: 24 },
  link: { alignSelf: "center", marginTop: 16 },
});
