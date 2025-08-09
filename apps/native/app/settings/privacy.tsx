import React from "react";
import { Text, View, ScrollView, Alert, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "This will remove all saved words and reset settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive" },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive" },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Privacy & Data",
          headerShown: true,
          headerBackTitle: "Settings",
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
                title="Clear All Data"
                subtitle="Remove all saved words and reset settings"
                onPress={handleClearData}
                variant="destructive"
                icon="trash"
              />
              <SettingsRow
                title="Delete Account"
                subtitle="Permanently delete your account"
                onPress={handleDeleteAccount}
                variant="destructive"
                icon="person-remove"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
