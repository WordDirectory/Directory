import React, { useState } from "react";
import { Text, View, ScrollView, StatusBar, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme, useThemeActions } from "../lib/theme-store";
import { ThemeMode } from "../lib/colors";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../src/components/settings-components";

export default function SettingsScreen() {
  const { colors, isDark, themeMode } = useTheme();
  const { setThemeMode } = useThemeActions();

  // Settings state for displaying current values in subtitles
  const [showImages, setShowImages] = useState(true);
  const [smartImageOpen, setSmartImageOpen] = useState("smart");
  const [hearExamplesBehavior, setHearExamplesBehavior] =
    useState("hear-examples");
  const [showRandomWords, setShowRandomWords] = useState(true);
  const [sensitivityLevel, setSensitivityLevel] = useState("0.5");
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleThemeChange = (newTheme: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(newTheme as ThemeMode);
  };

  const showThemeOptions = () => {
    Alert.alert("Theme", "Choose your preferred theme", [
      { text: "Light", onPress: () => handleThemeChange("light") },
      { text: "Dark", onPress: () => handleThemeChange("dark") },
      { text: "System", onPress: () => handleThemeChange("system") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const getImageLabel = () => (smartImageOpen === "smart" ? "Smart" : "Always");
  const getAudioLabel = () =>
    hearExamplesBehavior === "hear-examples" ? "Built-in" : "YouGlish";
  const getSensitivityLabel = () => {
    switch (sensitivityLevel) {
      case "0":
        return "Safe";
      case "0.5":
        return "Standard";
      case "1":
        return "All";
      default:
        return "Standard";
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerBackTitle: "Profile",
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.foreground },
          headerTintColor: colors.primary,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: 0, paddingBottom: 28 }}>
            <SettingsGroup>
              <SettingsRow
                title="Appearance"
                subtitle={`Theme: ${getThemeLabel()}`}
                onPress={showThemeOptions}
                icon="contrast"
                showArrow={false}
              />
              <SettingsRow
                title="Images"
                subtitle={
                  showImages ? `Display: ${getImageLabel()}` : "Disabled"
                }
                href="/settings/images"
                icon="image"
              />
              <SettingsRow
                title="Audio"
                subtitle={`Pronunciation: ${getAudioLabel()}`}
                href="/settings/audio"
                icon="volume-high"
              />
              <SettingsRow
                title="Search"
                subtitle={
                  showRandomWords
                    ? "Random words enabled"
                    : "Random words disabled"
                }
                href="/settings/search"
                icon="search"
              />
              <SettingsRow
                title="Content"
                subtitle={`Filter: ${getSensitivityLabel()}`}
                href="/settings/content"
                icon="shield-checkmark"
              />
              <SettingsRow
                title="Notifications"
                subtitle={pushNotifications ? "Enabled" : "Disabled"}
                href="/settings/notifications"
                icon="notifications"
              />
              <SettingsRow
                title="Support"
                subtitle="Help, feedback, and sharing"
                href="/settings/support"
                icon="help-circle"
              />
              <SettingsRow
                title="Privacy & Data"
                subtitle="Account and data management"
                href="/settings/privacy"
                icon="shield"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
