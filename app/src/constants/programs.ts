const PROGRAM_ICONS: Record<string, number> = {
  DOE: require("@/assets/shapes/doe.svg"),
  FJS: require("@/assets/shapes/fjs.svg"),
  FMW: require("@/assets/shapes/fmw.svg"),
  FAI: require("@/assets/shapes/fmw.svg"),
  FOS: require("@/assets/shapes/fos.svg"),
  ICS: require("@/assets/shapes/ics.svg"),
  IISC: require("@/assets/shapes/iisc.svg"),
  NET: require("@/assets/shapes/net.svg"),
  UXE: require("@/assets/shapes/uxe.svg"),
};

export function programIcon(program: string | null) {
  if (!program) return null;
  return PROGRAM_ICONS[program.trim().toUpperCase()] ?? null;
}
