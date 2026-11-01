import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

type YearPickerProps = {
  readonly options: number[];
  readonly value: number | null;
  readonly onChange: (year: number | null) => void;
};

export function formatYear(year: number | null) {
  return year != null ? String(year).padStart(2, "0") : "";
}

export function YearPicker({ options, value, onChange }: YearPickerProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>Programår (valfritt)</ThemedText>
      <View style={styles.yearOptions} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(selected ? null : option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`Programår ${formatYear(option)}`}
              style={({ pressed }) => [
                styles.yearOption,
                {
                  backgroundColor: selected
                    ? theme.primary
                    : theme.backgroundElement,
                  borderColor: selected
                    ? theme.primary
                    : theme.backgroundSelected,
                },
                pressed && styles.dimmed,
              ]}
            >
              <ThemedText
                style={[
                  styles.yearOptionText,
                  { color: selected ? theme.onPrimary : theme.text },
                ]}
              >
                {formatYear(option)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 12 },
  label: { fontWeight: "700" },
  dimmed: { opacity: 0.6 },
  yearOptions: { flexDirection: "row", gap: 8 },
  yearOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  yearOptionText: { fontWeight: "700" },
});
