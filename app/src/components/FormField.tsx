import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { ThemedText } from "./ThemedText";

type Props = TextInputProps & { readonly label: string };

export function FormField({ label, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 12 },
  label: { fontWeight: "700" },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
});