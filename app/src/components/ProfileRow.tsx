import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

type ProfileRowProps = {
  readonly label: string;
  readonly value: string | null;
};

export function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {value ? (
        <ThemedText>{value}</ThemedText>
      ) : (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Inte angivet
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2 },
  empty: { fontStyle: "italic" },
});

