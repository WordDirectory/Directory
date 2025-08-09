export type ThemeMode = "light" | "dark" | "system";

export interface ColorScheme {
  // Core colors matching globals.css
  background: string;
  foreground: string;

  // Card colors
  card: string;
  cardForeground: string;

  // Primary colors
  primary: string;
  primaryForeground: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;

  // Muted colors
  muted: string;
  mutedForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Destructive colors
  destructive: string;
  destructiveForeground: string;

  // Border and input
  border: string;
  input: string;

  // Additional native-specific colors
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  shadowColor: string;
}

export const lightColors: ColorScheme = {
  // Core colors - matching globals.css exactly
  background: "#ffffff", // --background: 0 0% 100%
  foreground: "#0a0a0a", // --foreground: 0 0% 3.9%

  // Card colors
  card: "#ffffff", // --card: 0 0% 100%
  cardForeground: "#0a0a0a", // --card-foreground: 0 0% 3.9%

  // Primary colors
  primary: "#171717", // --primary: 4 0% 9%
  primaryForeground: "#fafafa", // --primary-foreground: 0 0% 98%

  // Secondary colors
  secondary: "#ededed", // --secondary: 0 0% 93%
  secondaryForeground: "#171717", // --secondary-foreground: 0 0% 9%

  // Muted colors
  muted: "#f5f5f5", // --muted: 0 0% 96.1%
  mutedForeground: "#8c8c8c", // --muted-foreground: 0 0% 55%

  // Accent colors
  accent: "#f5f5f5", // --accent: 0 0% 96.1%
  accentForeground: "#171717", // --accent-foreground: 0 0% 9%

  // Destructive colors
  destructive: "#f87171", // --destructive: 0 84.2% 60.2%
  destructiveForeground: "#fafafa", // --destructive-foreground: 0 0% 98%

  // Border and input
  border: "#e5e5e5", // --border: 0 0% 89.8%
  input: "#e5e5e5", // --input: 0 0% 89.8%

  // Native-specific colors
  tabBarBackground: "#ffffff",
  tabBarActive: "#171717",
  tabBarInactive: "#8c8c8c",
  shadowColor: "#000000",
};

export const darkColors: ColorScheme = {
  // Core colors - matching globals.css exactly
  background: "#080808", // --background: 0 0% 3%
  foreground: "#fafafa", // --foreground: 0 0% 98%

  // Card colors
  card: "#0f0f0f", // --card: 0 0% 6%
  cardForeground: "#fafafa", // --card-foreground: 0 0% 98%

  // Primary colors
  primary: "#fafafa", // --primary: 0 0% 98%
  primaryForeground: "#171717", // --primary-foreground: 0 0% 9%

  // Secondary colors
  secondary: "#1a1a1a", // --secondary: 0 0% 14.9%
  secondaryForeground: "#fafafa", // --secondary-foreground: 0 0% 98%

  // Muted colors
  muted: "#1a1a1a", // --muted: 0 0% 14.9%
  mutedForeground: "#999999", // --muted-foreground: 0 0% 60%

  // Accent colors
  accent: "#1a1a1a", // --accent: 0 0% 10%
  accentForeground: "#fafafa", // --accent-foreground: 0 0% 98%

  // Destructive colors
  destructive: "#ff3333", // --destructive: 0 100% 60%
  destructiveForeground: "#fafafa", // --destructive-foreground: 0 0% 98%

  // Border and input
  border: "#1a1a1a", // --border: 0 0% 10%
  input: "#1a1a1a", // --input: 0 0% 14.9%

  // Native-specific colors
  tabBarBackground: "#080808",
  tabBarActive: "#fafafa",
  tabBarInactive: "#999999",
  shadowColor: "#080808",
};

export const getColors = (isDark: boolean): ColorScheme => {
  return isDark ? darkColors : lightColors;
};
