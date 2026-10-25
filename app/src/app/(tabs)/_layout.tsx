import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Tabs } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { HeaderBackground } from "@/components/HeaderBackground";
import { Pressable } from "react-native";
import { useSession } from "@/context/session";
import { TabBarBackground } from "@/components/TabBarBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const theme = useTheme();
  const { isAdmin } = useSession();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerTitle: "Chas Academy Studentkår",
        headerStyle: { backgroundColor: theme.header },
        headerTintColor: theme.onHeader,
        headerTitleStyle: { fontWeight: "700" },
        headerTitleAlign: "center",
        headerBackground: HeaderBackground,
        tabBarActiveTintColor: theme.onHeaderActive,
        tabBarInactiveTintColor: theme.onHeaderMuted,
        tabBarStyle: {
          backgroundColor: theme.header,
          borderTopWidth: 0,
          height: 68 + insets.bottom,
          paddingTop: 10,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Evenemang",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              color={color as string}
              size={size}
            />
          ),
          headerRight: isAdmin
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Nytt evenemang"
                  onPress={() => router.push("/event/form")}
                  style={{ marginRight: 16 }}
                >
                  <Ionicons name="add" size={28} color={theme.onHeader} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <Tabs.Screen
        name="registrations"
        options={{
          title: "Mina anmälningar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              color={color as string}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color as string}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
