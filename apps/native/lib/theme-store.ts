import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode, getColors, ColorScheme } from "./colors";

const THEME_STORAGE_KEY = "wordDirectory_theme_preference";
export const FALLBACK_THEME_MODE = "light" as const;

interface ThemeState {
  // Current theme mode setting
  themeMode: ThemeMode;

  // Whether the current resolved theme is dark
  isDark: boolean;

  // Current color scheme
  colors: ColorScheme;

  // Loading state
  isLoading: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
  handleSystemThemeChange: (colorScheme: "light" | "dark" | null) => void;
}

// Determine if the theme should be dark based on mode and system preference
const getIsDark = (
  mode: ThemeMode,
  systemColorScheme: "light" | "dark" | null
): boolean => {
  switch (mode) {
    case "dark":
      return true;
    case "light":
      return false;
    case "system":
      return systemColorScheme === "dark";
    default:
      return false;
  }
};

// Update colors based on dark mode
const updateThemeColors = (isDark: boolean) => ({
  colors: getColors(isDark),
});

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Initial state - will be updated during initialization
  themeMode: "system",
  isDark: false,
  colors: getColors(false),
  isLoading: true,

  setThemeMode: async (mode: ThemeMode) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

      // Get current system theme
      const systemColorScheme = Appearance.getColorScheme();
      const isDark = getIsDark(mode, systemColorScheme || FALLBACK_THEME_MODE);

      // Update state
      set({
        themeMode: mode,
        isDark,
        ...updateThemeColors(isDark),
      });
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  },

  initializeTheme: async () => {
    try {
      // Load saved theme preference
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const themeMode: ThemeMode = (savedTheme as ThemeMode) || "system";

      // Get current system theme
      const systemColorScheme = Appearance.getColorScheme();
      const isDark = getIsDark(
        themeMode,
        systemColorScheme || FALLBACK_THEME_MODE
      );

      // Update state
      set({
        themeMode,
        isDark,
        ...updateThemeColors(isDark),
        isLoading: false,
      });
    } catch (error) {
      console.warn("Failed to load theme preference:", error);

      // Fallback to system theme
      const systemColorScheme = Appearance.getColorScheme();
      const isDark = systemColorScheme === "dark";

      set({
        themeMode: "system",
        isDark,
        ...updateThemeColors(isDark),
        isLoading: false,
      });
    }
  },

  handleSystemThemeChange: (colorScheme: "light" | "dark" | null) => {
    const { themeMode } = get();

    // Only update if we're in system mode
    if (themeMode === "system") {
      const isDark = colorScheme === "dark";

      set({
        isDark,
        ...updateThemeColors(isDark),
      });
    }
  },
}));

// Helper hook to get theme colors easily
export const useTheme = () => {
  const { colors, isDark, themeMode, isLoading } = useThemeStore();

  return {
    colors,
    isDark,
    themeMode,
    isLoading,
  };
};

// Helper hook for theme actions
export const useThemeActions = () => {
  const { setThemeMode, initializeTheme } = useThemeStore();

  return {
    setThemeMode,
    initializeTheme,
  };
};
