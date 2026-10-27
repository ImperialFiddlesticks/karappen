import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import type { Registrant } from "@/api/events";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  readonly registrants: Registrant[];
};

function describeStudies(registrant: Registrant) {
  const parts = [
    registrant.program,
    registrant.year != null &&
      `programår ${String(registrant.year).padStart(2, "0")}`,
  ];
  return parts.filter(Boolean).join(", ");
}

export function RegistrantList({ registrants }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[styles.section, { backgroundColor: theme.backgroundElement }]}
    >
      <ThemedText accessibilityRole="header" style={styles.heading}>
        Anmälda({registrants.length})
      </ThemedText>
      {registrants.length === 0 && (
        <ThemedText themeColor="textSecondary">
          Ingen har anmält sig än.
        </ThemedText>
      )}

      {registrants.map((registrant) => (
        <View
          key={registrant.id}
          style={[styles.row, { borderTopColor: theme.backgroundSelected }]}
        >
          <ThemedText style={styles.name}>{registrant.name}</ThemedText>
          {describeStudies(registrant) !== "" && (
            <ThemedText themeColor="textSecondary">
              {describeStudies(registrant)}
            </ThemedText>
          )}
          {registrant.dietary && (
            <View style={styles.dietary}>
              <Ionicons
                name="restaurant-outline"
                size={16}
                color={theme.accent}
              />
              <ThemedText themeColor="accent">{registrant.dietary}</ThemedText>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 16, padding: 16, gap: 4, marginTop: 8 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  row: { borderTopWidth: 1, paddingVertical: 10, gap: 2 },
  name: { fontWeight: "700" },
  dietary: { flexDirection: "row", alignItems: "center", gap: 6 },
});
