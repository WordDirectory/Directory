import React, { useState } from "react";
import { Text, View, ScrollView, Switch, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [wordOfTheDay, setWordOfTheDay] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
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
                title="Push Notifications"
                subtitle="Receive notifications"
                rightElement={
                  <Switch
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                    trackColor={{
                      false: colors.muted,
                      true: colors.primary + "40",
                    }}
                    thumbColor={
                      pushNotifications
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                }
                icon="notifications"
              />
              <SettingsRow
                title="Word of the Day"
                subtitle="Daily word notifications"
                rightElement={
                  <Switch
                    value={wordOfTheDay}
                    onValueChange={setWordOfTheDay}
                    trackColor={{
                      false: colors.muted,
                      true: colors.primary + "40",
                    }}
                    thumbColor={
                      wordOfTheDay ? colors.primary : colors.mutedForeground
                    }
                  />
                }
                isLast
              />
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
