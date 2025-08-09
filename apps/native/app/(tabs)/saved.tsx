import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { TouchableOpacity } from "../../src/components/touchable-opacity";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../lib/theme-store";
import { router } from "expo-router";

// Mock saved words data
const SAVED_WORDS = [
  {
    word: "serendipity",
    definition: "The occurrence of events by chance in a happy way",
  },
  {
    word: "ephemeral",
    definition: "Lasting for a very short time; temporary",
  },
  {
    word: "wanderlust",
    definition: "A strong desire to travel and explore the world",
  },
  {
    word: "mellifluous",
    definition: "Sweet or musical; pleasant to hear",
  },
  {
    word: "petrichor",
    definition: "The pleasant smell of earth after rain",
  },
  {
    word: "sonder",
    definition:
      "The realization that others have complex lives beyond our perception",
  },
];

interface SavedWordRowProps {
  word: string;
  definition: string;
  onPress: (word: string) => void;
  onRemove: (word: string) => void;
  isLast?: boolean;
}

function SavedWordRow({
  word,
  definition,
  onPress,
  onRemove,
  isLast = false,
}: SavedWordRowProps) {
  const { colors } = useTheme();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Remove Word", `Remove "${word}" from saved words?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onRemove(word);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(word);
      }}
      onLongPress={handleLongPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.background,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 4,
            textTransform: "capitalize",
          }}
        >
          {word}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.mutedForeground,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {definition}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.mutedForeground}
        style={{ marginLeft: 12 }}
      />
    </TouchableOpacity>
  );
}

interface EmptyStateProps {
  onGetStarted: () => void;
}

function EmptyState({ onGetStarted }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
      }}
    >
      <Ionicons
        name="bookmark-outline"
        size={64}
        color={colors.mutedForeground}
        style={{ marginBottom: 24 }}
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: colors.foreground,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        No saved words
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: colors.mutedForeground,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 32,
        }}
      >
        Words you save will appear here for quick access
      </Text>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onGetStarted();
        }}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 24,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.primaryForeground,
          }}
        >
          Start Exploring
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SavedWordsScreen() {
  const [savedWords, setSavedWords] = useState(SAVED_WORDS);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();

  const handleWordPress = (word: string) => {
    router.push(`/word/${word}`);
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setSavedWords((prevWords) =>
      prevWords.filter((word) => word.word !== wordToRemove)
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleGetStarted = () => {
    console.log("Navigate to search");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {savedWords.length === 0 ? (
        <EmptyState onGetStarted={handleGetStarted} />
      ) : (
        <>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <Text
              style={{
                fontSize: 17,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              {savedWords.length} saved word{savedWords.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* List */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {savedWords.map((wordData, index) => (
              <SavedWordRow
                key={wordData.word}
                word={wordData.word}
                definition={wordData.definition}
                onPress={handleWordPress}
                onRemove={handleRemoveWord}
                isLast={index === savedWords.length - 1}
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
