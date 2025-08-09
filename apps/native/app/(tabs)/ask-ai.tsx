import React from "react";
import { Text, View, StatusBar } from "react-native";
import { useTheme } from "../../lib/theme-store";

export default function AskAIScreen() {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: colors.foreground,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Hello World!
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: colors.mutedForeground,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Welcome to the Ask AI screen
        </Text>
      </View>
    </View>
  );
}
