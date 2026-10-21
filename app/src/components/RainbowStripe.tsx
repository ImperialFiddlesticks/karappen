import { StyleSheet, View } from "react-native";

import { Stripe } from "@/constants/theme";

export function RainbowStripe() {
  return (
    <View style={styles.stripe}>
      {Stripe.map((color) => (
        <View
          key={color}
          style={[styles.segment, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  stripe: {
    flexDirection: "row",
    height: 4,
  },
  segment: {
    flex: 1,
  },
});
