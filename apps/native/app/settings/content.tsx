import React, { useState } from "react";
import { Text, View, ScrollView, Alert, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function ContentScreen() {
  const { colors, isDark } = useTheme();
  const [sensitivityLevel, setSensitivityLevel] = useState("0.5");

  const showSensitivityOptions = () => {
    Alert.alert("Content Sensitivity", "Choose content filter level", [
      { text: "Safe", onPress: () => setSensitivityLevel("0") },
      { text: "Standard", onPress: () => setSensitivityLevel("0.5") },
      { text: "All", onPress: () => setSensitivityLevel("1") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

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
          title: "Content",
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
                title="Sensitivity Filter"
                subtitle="Choose content filter level"
                onPress={showSensitivityOptions}
                rightElement={
                  <Text style={{ color: colors.mutedForeground, fontSize: 15 }}>
                    {getSensitivityLabel()}
                  </Text>
                }
                icon="shield-checkmark"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
