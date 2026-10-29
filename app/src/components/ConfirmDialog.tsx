import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button } from "./Button";

import { RainbowStripe } from "./RainbowStripe";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  readonly visible: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Avbryt"
        />
        <View
          style={[styles.dialog, { backgroundColor: theme.card }]}
          accessibilityViewIsModal
        >
          <RainbowStripe />
          <View style={styles.content}>
            <ThemedText accessibilityRole="header" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText>{message}</ThemedText>
            <View style={styles.buttons}>
              <Button title="Avbryt" variant="secondary" onPress={onCancel} />
              <Button
                title={confirmLabel}
                variant="danger"
                onPress={onConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(17, 22, 51, 0.6)",
  },
  dialog: {
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
});
