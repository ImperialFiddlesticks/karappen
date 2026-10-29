import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Shape = {
  readonly source: number;
  readonly size: number;
  readonly position: Pick<ViewStyle, "top" | "bottom" | "left" | "right">;
  readonly opacity: number;
};

const SHAPES: Shape[] = [
  {
    source: require("@/assets/shapes/uxe.svg"),
    size: 170,
    position: { top: "6%", right: -60 },
    opacity: 1,
  },
  {
    source: require("@/assets/shapes/doe.svg"),
    size: 120,
    position: { top: -35, left: -35 },
    opacity: 0.9,
  },
  {
    source: require("@/assets/shapes/net.svg"),
    size: 150,
    position: { bottom: "6%", left: -40 },
    opacity: 1,
  },
  {
    source: require("@/assets/shapes/fos.svg"),
    size: 130,
    position: { bottom: -45, right: -20 },
    opacity: 0.9,
  },

  {
    source: require("@/assets/shapes/fjs.svg"),
    size: 160,
    position: { top: "28%", left: "-10%" },
    opacity: 0.85,
  },
  {
    source: require("@/assets/shapes/iisc.svg"),
    size: 140,
    position: { top: "45%", right: "-5%" },
    opacity: 0.85,
  },
  {
    source: require("@/assets/shapes/fmw.svg"),
    size: 110,
    position: { bottom: "10%", left: "45%" },
    opacity: 0.8,
  },
  {
    source: require("@/assets/shapes/ics.svg"),
    size: 110,
    position: { top: "12%", right: "45%" },
    opacity: 0.8,
  },
];

export function DecorativeShapes() {
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SHAPES.map((shape, index) => (
        <Image
          key={index}
          source={shape.source}
          contentFit="contain"
          style={[
            styles.shape,
            shape.position,
            { width: shape.size, height: shape.size, opacity: shape.opacity },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    position: "absolute",
  },
});
