import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Appearance,
  Platform,
  useColorScheme as useSystemColorScheme,
} from "react-native";

import { loadPreference, savePreference } from "@/utils/preferenceStorage";

export type ColorSchemePreference = "system" | "light" | "dark";

type ColorSchemeContextValue = {
  preference: ColorSchemePreference;
  colorScheme: "light" | "dark";
  setPreference: (preference: ColorSchemePreference) => void;
  toggleColorScheme: () => void;
};

const STORAGE_KEY = "color-scheme";
const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

function resolveColorScheme(
  preference: ColorSchemePreference,
  systemColorScheme: string | null | undefined,
): "light" | "dark" {
  if (preference !== "system") return preference;
  return systemColorScheme === "dark" ? "dark" : "light";
}
function isPreference(value: string | null): value is ColorSchemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const [preference, setPreferenceState] =
    useState<ColorSchemePreference>("system");

  function applyPreference(next: ColorSchemePreference) {
    setPreferenceState(next);
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(next === "system" ? "unspecified" : next);
    }
  }

  useEffect(() => {
    loadPreference(STORAGE_KEY).then((saved) => {
      if (isPreference(saved)) applyPreference(saved);
    });
  }, []);

  function setPreference(next: ColorSchemePreference) {
    applyPreference(next);
    savePreference(STORAGE_KEY, next);
  }

  const colorScheme = resolveColorScheme(preference, systemColorScheme);

  function toggleColorScheme() {
    setPreference(colorScheme === "dark" ? "light" : "dark");
  }

  return (
    <ColorSchemeContext.Provider
      value={{ preference, colorScheme, setPreference, toggleColorScheme }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorSchemePreference() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error(
      "useColorSchemePreference måste användas inuti <ColorSchemeProvider>",
    );
  }
  return context;
}

export function useColorScheme() {
  return useColorSchemePreference().colorScheme;
}
