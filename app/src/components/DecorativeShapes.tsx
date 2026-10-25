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
    position: { top: "8%", right: -60 },
    opacity: 0.9,
  },
  {
    source: require("@/assets/shapes/fjs.svg"),
    size: 90,
    position: { top: "18%", left: -25 },
    opacity: 0.45,
  },
  {
    source: require("@/assets/shapes/net.svg"),
    size: 140,
    position: { bottom: "8%", left: -35 },
    opacity: 0.9,
  },
  {
    source: require("@/assets/shapes/iisc.svg"),
    size: 100,
    position: { bottom: "20%", right: -20 },
    opacity: 0.5,
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
