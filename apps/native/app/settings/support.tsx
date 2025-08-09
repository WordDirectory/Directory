import React from "react";
import { Text, View, ScrollView, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function SupportScreen() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Support",
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
                title="Rate App"
                subtitle="Leave a review on the App Store"
                onPress={() => console.log("Rate app")}
                icon="star"
              />
              <SettingsRow
                title="Share App"
                subtitle="Tell your friends about WordDirectory"
                onPress={() => console.log("Share app")}
                icon="share"
              />
              <SettingsRow
                title="Contact Support"
                subtitle="Get help with any issues"
                onPress={() => console.log("Contact support")}
                icon="mail"
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
