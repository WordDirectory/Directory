import React, { useState } from "react";
import { Text, View, ScrollView, Alert, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function AudioScreen() {
  const { colors, isDark } = useTheme();
  const [hearExamplesBehavior, setHearExamplesBehavior] =
    useState("hear-examples");

  const showAudioOptions = () => {
    Alert.alert("Audio Behavior", "Choose pronunciation method", [
      {
        text: "Built-in",
        onPress: () => setHearExamplesBehavior("hear-examples"),
      },
      { text: "YouGlish", onPress: () => setHearExamplesBehavior("youglish") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getAudioLabel = () =>
    hearExamplesBehavior === "hear-examples" ? "Built-in" : "YouGlish";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Audio",
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
                title="Pronunciation"
                subtitle="Choose pronunciation method"
                onPress={showAudioOptions}
                rightElement={
                  <Text style={{ color: colors.mutedForeground, fontSize: 15 }}>
                    {getAudioLabel()}
                  </Text>
                }
                icon="volume-high"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
