import { useTheme } from "@/hooks/use-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

type AvatarProps = {
  readonly uri: string | null;
  readonly size?: number;
  readonly onPress?: () => void;
  readonly isUploading?: boolean;
};

export function Avatar({
  uri: url,
  size = 88,
  onPress,
  isUploading = false,
}: AvatarProps) {
  const theme = useTheme();
  const circle = { width: size, height: size, borderRadius: size / 2 };

  const content = (
    <>
      {url ? (
        <Image
          source={{ uri: url }}
          contentFit="cover"
          accessibilityLabel="Profilbild"
          style={circle}
        />
      ) : (
        <View
          style={[
            circle,
            styles.placeholder,
            { backgroundColor: theme.backgroundSelected },
          ]}
        >
          <Ionicons
            name="person"
            size={size * 0.5}
            color={theme.textSecondary}
          />
        </View>
      )}
      {isUploading && (
        <View style={[circle, styles.overlay]}>
          <ActivityIndicator color="#ffffff" accessibilityLabel="Laddar upp" />
        </View>
      )}
      {onPress && !isUploading && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.primary,
              borderColor: theme.backgroundElement,
            },
          ]}
        >
          <Ionicons name="camera" size={14} color={theme.onPrimary} />
        </View>
      )}
    </>
  );

  if (!onPress) return <View style={circle}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      disabled={isUploading}
      accessibilityRole="button"
      accessibilityLabel={url ? "Byt profilbild" : "Lägg till profilbild"}
      style={({ pressed }) => [circle, pressed && styles.dimmed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: { opacity: 0.6 },
});
