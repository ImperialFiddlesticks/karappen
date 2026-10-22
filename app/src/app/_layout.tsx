import { SessionProvider, useSession } from "@/context/session";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { HeaderBackground } from "@/components/HeaderBackground";

function RootNavigator() {
  const { token, isLoading } = useSession();
  const theme = useTheme();
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="event/[id]"
          options={{
            headerShown: true,
            title: "Evenemang",
            headerBackTitle: "Tillbaka",
            headerStyle: { backgroundColor: theme.header },
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
            headerStyle: { backgroundColor: theme.header },
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
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </SessionProvider>
  );
}
