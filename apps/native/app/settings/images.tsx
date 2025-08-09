import React, { useState } from "react";
import { Text, View, ScrollView, Switch, Alert, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";
import {
  SettingsGroup,
  SettingsRow,
} from "../../src/components/settings-components";

export default function ImagesScreen() {
  const { colors, isDark } = useTheme();
  const [showImages, setShowImages] = useState(true);
  const [smartImageOpen, setSmartImageOpen] = useState("smart");

  const showImageOptions = () => {
    Alert.alert("Smart Image Display", "Control when images are shown", [
      { text: "Smart (AI decides)", onPress: () => setSmartImageOpen("smart") },
      { text: "Always show", onPress: () => setSmartImageOpen("always") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getImageLabel = () => (smartImageOpen === "smart" ? "Smart" : "Always");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Images",
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
                title="Show Images"
                subtitle="Display images for word definitions"
                rightElement={
                  <Switch
                    value={showImages}
                    onValueChange={setShowImages}
                    trackColor={{
                      false: colors.muted,
                      true: colors.primary + "40",
                    }}
                    thumbColor={
                      showImages ? colors.primary : colors.mutedForeground
                    }
                  />
                }
                icon="image"
              />
              {showImages && (
                <SettingsRow
                  title="Image Display"
                  subtitle="Control when images are shown"
                  onPress={showImageOptions}
                  rightElement={
                    <Text
                      style={{ color: colors.mutedForeground, fontSize: 15 }}
                    >
                      {getImageLabel()}
                    </Text>
                  }
                  isLast
                />
              )}
            </SettingsGroup>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
