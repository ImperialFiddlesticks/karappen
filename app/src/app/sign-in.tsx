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

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/context/session";
import { DecorativeShapes } from "@/components/DecorativeShapes";
import { FormCard } from "@/components/FormCard";

export default function SignInScreen() {
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Fyll i e-post och lösenord");
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
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
                label="E-post"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="student@chasacademy.se"
                returnKeyType="next"
              />
              <FormField
                label="Lösenord"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                onSubmitEditing={handleSubmit}
                placeholder="********"
                returnKeyType="done"
              />

              {error && (
                <ThemedText themeColor="danger" accessibilityRole="alert">
                  {error}
                </ThemedText>
              )}

              <Button
                title={isSubmitting ? "Loggar in..." : "Logga in"}
                onPress={handleSubmit}
                disabled={isSubmitting}
              />

              <Link href="/register" style={styles.link}>
                <ThemedText themeColor="accent">
                  Inget konto? Registrera dig här
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
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 8 },
  title: { textAlign: "center", marginBottom: 24 },
  link: { alignSelf: "center", marginTop: 16 },
  // TILLFÄLLIGT
  tempToggle: {
    alignSelf: "flex-end",
    margin: 16,
    paddingVertical: 8,
    paddingRight: 16,
    borderRadius: 999,
  },
});
