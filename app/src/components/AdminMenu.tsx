import Ionicons from "@expo/vector-icons/Ionicons";
import { useHeaderHeight } from "expo-router/build/react-navigation/index.js";
import type { ComponentProps } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/use-theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type AdminMenuItem = {
  readonly label: string;
  readonly icon: IconName;
  readonly onPress: () => void;
  readonly destructive?: boolean;
};

type Props = {
  readonly visible: boolean;
  readonly items: AdminMenuItem[];
  readonly onClose: () => void;
};

export function AdminMenu({ visible, items, onClose }: Props) {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Stäng menyn"
      />
      <View
        accessibilityRole="menu"
        style={[
          styles.menu,
          { top: headerHeight - 4, backgroundColor: theme.card },
        ]}
      >
        {items.map((item) => {
          const color = item.destructive ? theme.danger : theme.text;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="menuitem"
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.item,
                pressed && { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={color} />
              <ThemedText style={[styles.label, { color }]}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 12,
    minWidth: 180,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: "600",
  },
});
