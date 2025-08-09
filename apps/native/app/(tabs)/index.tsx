import { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
  RefreshControl,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../lib/theme-store";
import { TouchableOpacity } from "../../src/components/touchable-opacity";
import { SearchView } from "@/src/components/search-view";
import { router } from "expo-router";

const RECENT_SEARCHES_KEY = "@recent_searches";
const MAX_RECENT_SEARCHES = 12;

// Sample data for the search screen content
const POPULAR_WORDS = [
  "serendipity",
  "ephemeral",
  "quintessential",
  "ubiquitous",
  "paradigm",
  "catalyst",
  "resilience",
  "innovation",
];

const TRENDING_WORDS = [
  { word: "algorithm", trend: "up" },
  { word: "sustainable", trend: "up" },
  { word: "blockchain", trend: "down" },
  { word: "mindfulness", trend: "up" },
  { word: "cryptocurrency", trend: "down" },
];

const WORD_OF_THE_DAY = {
  word: "perspicacious",
  definition: "Having a ready insight into and understanding of things",
  pronunciation: "/ˌpɜːrspɪˈkeɪʃəs/",
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [pressedWordOfDay, setPressedWordOfDay] = useState(false);
  const [pressedTrendingIndex, setPressedTrendingIndex] = useState<
    number | null
  >(null);
  const [pressedPopularIndex, setPressedPopularIndex] = useState<number | null>(
    null
  );
  const [pressedRecentIndex, setPressedRecentIndex] = useState<number | null>(
    null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const { colors, isDark } = useTheme();

  // Load recent searches from AsyncStorage on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error("Error saving recent searches:", error);
    }
  };

  const addToRecentSearches = async (word: string) => {
    const normalizedWord = word.toLowerCase().trim();
    if (!normalizedWord) return;

    setRecentSearches((prev) => {
      // Remove if already exists (to move to front)
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== normalizedWord
      );
      // Add to front and limit to MAX_RECENT_SEARCHES
      const updated = [normalizedWord, ...filtered].slice(
        0,
        MAX_RECENT_SEARCHES
      );

      // Save to AsyncStorage
      saveRecentSearches(updated);

      return updated;
    });
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  };

  const handleWordPress = (word: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Add to recent searches
    addToRecentSearches(word);
    // In real app, navigate to word detail screen
    router.push(`/word/${word}`);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToRecentSearches(query.trim());
    }
  };

  const handleOpenSearch = () => {
    setIsSearchFocused(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Focus the search input after animation completes
      searchInputRef.current?.focus();
    });
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.blur();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Only remove the component after the fade out animation completes
      setIsSearchFocused(false);
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Content */}
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
        {/* Header */}
        <View style={{ backgroundColor: colors.background }}>
          {/* Search Input Button */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 40,
            }}
          >
            <TouchableOpacity
              onPress={handleOpenSearch}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 24,
                paddingLeft: 20,
                paddingRight: 20,
                height: 50,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity="none"
            >
              <Ionicons
                name="search"
                size={20}
                color={colors.mutedForeground}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 17,
                  color: colors.mutedForeground,
                  fontWeight: "400",
                }}
              >
                Search a word
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Word of the Day */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            Word of the day
          </Text>
          <TouchableOpacity
            onPress={() => handleWordPress(WORD_OF_THE_DAY.word)}
            onPressIn={() => setPressedWordOfDay(true)}
            onPressOut={() => setPressedWordOfDay(false)}
            style={{
              backgroundColor: pressedWordOfDay
                ? colors.secondary
                : colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity="none"
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="star"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: colors.foreground,
                  flex: 1,
                }}
              >
                {WORD_OF_THE_DAY.word}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                marginBottom: 8,
                fontStyle: "italic",
              }}
            >
              {WORD_OF_THE_DAY.pronunciation}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.foreground,
                lineHeight: 22,
              }}
            >
              {WORD_OF_THE_DAY.definition}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trending Words */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            Trending words
          </Text>
          {TRENDING_WORDS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleWordPress(item.word)}
              onPressIn={() => setPressedTrendingIndex(index)}
              onPressOut={() => setPressedTrendingIndex(null)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  pressedTrendingIndex === index
                    ? colors.secondary
                    : colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity="none"
            >
              <Ionicons
                name={item.trend === "up" ? "trending-up" : "trending-down"}
                size={18}
                color={item.trend === "up" ? "#22c55e" : "#ef4444"}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "500",
                  color: colors.foreground,
                  flex: 1,
                }}
              >
                {item.word}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Words */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            Popular words
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -4,
            }}
          >
            {POPULAR_WORDS.map((word, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleWordPress(word)}
                onPressIn={() => setPressedPopularIndex(index)}
                onPressOut={() => setPressedPopularIndex(null)}
                style={{
                  backgroundColor:
                    pressedPopularIndex === index
                      ? colors.secondary
                      : colors.card,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginHorizontal: 4,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity="none"
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: colors.foreground,
                  }}
                >
                  {word}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                Recent searches
              </Text>
              <TouchableOpacity
                onPress={clearRecentSearches}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.mutedForeground,
                    fontWeight: "500",
                  }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -4,
              }}
            >
              {recentSearches.slice(0, 8).map((word, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleWordPress(word)}
                  onPressIn={() => setPressedRecentIndex(index)}
                  onPressOut={() => setPressedRecentIndex(null)}
                  style={{
                    backgroundColor:
                      pressedRecentIndex === index
                        ? colors.secondary
                        : colors.card,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    marginHorizontal: 4,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  activeOpacity="none"
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.mutedForeground}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Footer spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Search View */}
      {isSearchFocused && (
        <SearchView
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onWordPress={handleWordPress}
          onClose={handleCloseSearch}
          onSearch={handleSearch}
          fadeAnim={fadeAnim}
          searchInputRef={searchInputRef}
          recentSearches={recentSearches}
          onClearRecentSearches={clearRecentSearches}
        />
      )}
    </View>
  );
}
