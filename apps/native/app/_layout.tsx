import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Appearance, View, ActivityIndicator } from "react-native";
import {
  FALLBACK_THEME_MODE,
  useTheme,
  useThemeActions,
  useThemeStore,
} from "../lib/theme-store";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Inter-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { colors, isDark, isLoading: themeLoading } = useTheme();
  const { initializeTheme } = useThemeActions();
  const handleSystemThemeChange = useThemeStore(
    (state) => state.handleSystemThemeChange
  );

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize theme on app start
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      handleSystemThemeChange(colorScheme || FALLBACK_THEME_MODE);
    });

    return () => subscription?.remove();
  }, [handleSystemThemeChange]);

  // Hide splash screen when both fonts and theme are loaded
  useEffect(() => {
    if (loaded && !themeLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, themeLoading]);

  // Show loading screen while theme is being initialized to prevent flicker
  if (!loaded || themeLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="saved" options={{ headerShown: false }} />
          <Stack.Screen name="word/[word]" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
