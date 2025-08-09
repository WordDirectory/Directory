import React from "react";
import { Text, View, ScrollView, StatusBar } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../lib/theme-store";
import { Stack } from "expo-router";

// Hard-coded word data for UI demonstration
const WORD_DATA = {
  word: "serendipity",
  definitions: [
    {
      text: "The pleasant surprise of finding something valuable or delightful when you weren't looking for it",
      examples: [
        "Finding my favorite childhood book at a random bookstore was pure serendipity",
        "Their meeting was serendipity - neither expected to find love at a work conference",
      ],
    },
    {
      text: "A happy accident or fortunate coincidence that leads to something good",
      examples: [
        "The coffee shop running out of my usual drink led to serendipity when I discovered an even better one",
        "Getting lost in the city was serendipity - we stumbled upon the most amazing restaurant",
      ],
    },
  ],
};

export default function WordScreen() {
  const route = useRoute();
  const { colors, isDark } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: WORD_DATA.word,
          headerShown: true,
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: {
            color: colors.foreground,
            fontSize: 18,
            fontWeight: "600",
          },
          headerTintColor: colors.primary,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <ScrollView
          style={{ flex: 1, padding: 5 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Word Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              {capitalize(WORD_DATA.word)}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.mutedForeground,
                opacity: 0.7,
              }}
            >
              {WORD_DATA.definitions.length} definition
              {WORD_DATA.definitions.length > 1 ? "s" : ""}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginTop: 16,
            }}
          />

          {/* Definitions */}
          <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 20,
                opacity: 0.85,
              }}
            >
              Definitions
            </Text>

            {WORD_DATA.definitions.map((definition, index) => (
              <View key={index}>
                {/* Definition */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "500",
                      color: colors.mutedForeground,
                      marginRight: 12,
                      marginTop: 2,
                      minWidth: 24,
                    }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      color: colors.foreground,
                      opacity: 0.8,
                      flex: 1,
                    }}
                  >
                    {definition.text}
                  </Text>
                </View>

                {/* Examples */}
                {definition.examples.length > 0 && (
                  <View style={{ marginLeft: 36 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: colors.mutedForeground,
                        marginBottom: 12,
                        opacity: 0.7,
                      }}
                    >
                      Usage Examples
                    </Text>

                    <View style={{ gap: 12 }}>
                      {definition.examples.map((example, exampleIndex) => (
                        <View
                          key={exampleIndex}
                          style={{
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            shadowColor: colors.shadowColor,
                            shadowOffset: {
                              width: 0,
                              height: 1,
                            },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              lineHeight: 22,
                              color: colors.foreground,
                              opacity: 0.85,
                            }}
                          >
                            "{example}"
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Separator between definitions */}
                {index < WORD_DATA.definitions.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginVertical: 28
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
