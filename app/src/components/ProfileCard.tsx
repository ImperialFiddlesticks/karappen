import { Profile } from "@/api/profile";
import { programIcon } from "@/constants/programs";
import { useTheme } from "@/hooks/use-theme";
import { formatYear } from "./YearPicker";
import { StyleSheet, View } from "react-native";
import { assetUrl } from "@/api/client";
import { Avatar } from "./Avatar";
import { ThemedText } from "./ThemedText";
import { Image } from "expo-image";

type ProfileCardProps = {
  readonly profile: Profile;
  readonly isAdmin: boolean;
  readonly onPressAvatar: () => void;
  readonly isUploadingAvatar: boolean;
};

export function ProfileCard({
  profile,
  isAdmin,
  onPressAvatar,
  isUploadingAvatar,
}: ProfileCardProps) {
  const theme = useTheme();
  const icon = programIcon(profile.program);
  const classCode =
    profile.program || profile.year != null
      ? `${profile.program ?? ""}${formatYear(profile.year)}`
      : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}
    >
      <Avatar
        uri={profile.avatar_url ? assetUrl(profile.avatar_url) : null}
        onPress={onPressAvatar}
        isUploading={isUploadingAvatar}
      />
      <View style={styles.info}>
        <ThemedText themeColor="accent" style={styles.role}>
          {isAdmin ? "Administratör" : "Medlem"}
        </ThemedText>
        <View style={styles.nameRow}>
          {icon && (
            <Image
              source={icon}
              contentFit="contain"
              accessibilityLabel={`Program: ${profile.program}`}
              style={styles.programIcon}
            />
          )}
          <ThemedText style={styles.name}>{profile.name}</ThemedText>
          {classCode && (
            <View
              style={[
                styles.pill,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText type="small" themeColor="textSecondary">
                {classCode}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  info: { flex: 1, gap: 4 },
  role: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  programIcon: { width: 28, height: 28 },
  name: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
});
