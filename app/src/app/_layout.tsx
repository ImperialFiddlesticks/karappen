import { SessionProvider, useSession } from "@/context/session";
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { ColorSchemeProvider } from "@/context/color-scheme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { HeaderBackground } from "@/components/HeaderBackground";

function RootNavigator() {
  const { token, isLoading } = useSession();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="event/[id]"
            options={{
              headerShown: true,
              title: "Evenemang",
              headerBackTitle: "Tillbaka",
              headerTintColor: theme.onHeader,
              headerBackground: HeaderBackground,
            }}
          />
          <Stack.Screen
            name="event/form"
            options={{
              headerShown: true,
              title: "Nytt evenemang",
              headerBackTitle: "Tillbaka",
              headerTintColor: theme.onHeader,
              headerBackground: HeaderBackground,
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="register" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ColorSchemeProvider>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </ColorSchemeProvider>
  );
}
