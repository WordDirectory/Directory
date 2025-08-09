import React, { useState } from "react";
import { Text, View, ScrollView, Switch, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const [showRandomWords, setShowRandomWords] = useState(true);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Search",
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
                title="Random Words"
                subtitle="Show suggestions when search is empty"
                rightElement={
                  <Switch
                    value={showRandomWords}
                    onValueChange={setShowRandomWords}
                    trackColor={{
                      false: colors.muted,
                      true: colors.primary + "40",
                    }}
                    thumbColor={
                      showRandomWords ? colors.primary : colors.mutedForeground
                    }
                  />
                }
                icon="shuffle"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
