import { useTheme } from "@/lib/theme-store";
import { forwardRef, useState } from "react";
import { Animated, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { TouchableOpacity } from "@/src/components/touchable-opacity";
import { WORDS } from "../data/words";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onWordPress: (word: string) => void;
  onClose: () => void;
  onSearch: (query: string) => void;
  fadeAnim: Animated.Value;
  searchInputRef: React.RefObject<TextInput | null>;
  recentSearches: string[];
  onClearRecentSearches: () => void;
}

export function SearchView({
  searchQuery,
  onSearchChange,
  onWordPress,
  onClose,
  onSearch,
  fadeAnim,
  searchInputRef,
  recentSearches,
  onClearRecentSearches,
}: SearchViewProps) {
  const { colors, isDark } = useTheme();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const filteredWords = searchQuery
    ? WORDS.filter((word) =>
        word.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : WORDS;

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      onWordPress(searchQuery.trim());
      onClose();
    }
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        opacity: fadeAnim,
        zIndex: 1000,
      }}
    >
      <View style={{ flex: 1, paddingTop: 0 }}>
        {/* Search Input with Back Arrow */}
        <View style={{ paddingTop: 16, zIndex: 2 }}>
          <SearchBarWithBack
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={onSearchChange}
            onBackPress={onClose}
            onSubmit={handleSearchSubmit}
          />
        </View>

        {/* Fade overlay below search input */}
        <LinearGradient
          colors={[colors.background, isDark ? "#00000000" : "#ffffff00"]}
          style={{
            position: "absolute",
            top: 65,
            left: 0,
            right: 0,
            height: 35,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Search Results */}
        <View style={{ flex: 1, position: "relative" }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardDismissMode="interactive"
          >
            {/* Content Section with consistent padding */}
            <View style={{ paddingTop: 16, paddingBottom: 16, gap: 12 }}>
              {/* Recent Searches Section */}
              {!searchQuery && recentSearches.length > 0 && (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      paddingTop: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      Recent searches
                    </Text>
                    <TouchableOpacity onPress={onClearRecentSearches}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.primary,
                        }}
                      >
                        Clear all
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 20,
                    }}
                  >
                    {recentSearches.map((word, index) => {
                      const isPressed = pressedIndex === index;
                      return (
                        <TouchableOpacity
                          key={`recent-${word}-${index}`}
                          onPress={() => onWordPress(word)}
                          onPressIn={() => setPressedIndex(index)}
                          onPressOut={() => setPressedIndex(null)}
                          style={{
                            backgroundColor: isPressed
                              ? colors.secondary
                              : colors.background,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginRight: 8,
                          }}
                          activeOpacity="none"
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "500",
                              color: colors.foreground,
                              textTransform: "capitalize",
                            }}
                          >
                            {word}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Search Results Content */}
              <SearchResults
                filteredWords={filteredWords}
                onWordPress={onWordPress}
                onClose={onClose}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
}

interface SearchBarWithBackProps {
  value: string;
  onChangeText: (text: string) => void;
  onBackPress: () => void;
  onSubmit: () => void;
  placeholder?: string;
}

const SearchBarWithBack = forwardRef<TextInput, SearchBarWithBackProps>(
  ({ value, onChangeText, onBackPress, onSubmit, placeholder }, ref) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const handleContainerPress = () => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.focus();
      }
    };

    return (
      <TouchableWithoutFeedback onPress={handleContainerPress}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.input,
            borderRadius: 24,
            paddingLeft: 16,
            paddingRight: 20,
            height: 50,
            marginHorizontal: 20,
            borderWidth: isFocused ? 2 : 1,
            borderColor: isFocused ? colors.primary : colors.border,
          }}
        >
          <TouchableOpacity
            onPress={onBackPress}
            style={{
              padding: 4,
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <TextInput
            ref={ref}
            style={{
              flex: 1,
              fontSize: 17,
              color: colors.foreground,
              fontWeight: "500",
            }}
            placeholder={placeholder || "Search a word"}
            placeholderTextColor={colors.mutedForeground}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {value.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeText("")}
              style={{ padding: 3 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

SearchBarWithBack.displayName = "SearchBarWithBack";

interface SearchResultsProps {
  filteredWords: string[];
  onWordPress: (word: string) => void;
  onClose: () => void;
}

function SearchResults({
  filteredWords,
  onWordPress,
  onClose,
}: SearchResultsProps) {
  const { colors } = useTheme();

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
      {filteredWords.length > 0 ? (
        <View style={{ gap: 16 }}>
          {filteredWords.map((word, index) => (
            <TouchableOpacity
              key={`search-view-word-${word}-${index}`}
              onPress={() => onWordPress(word)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 4,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.cardForeground,
                    textTransform: "capitalize",
                  }}
                >
                  {word}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 100,
          }}
        >
          <Ionicons
            name="search"
            size={48}
            color={colors.mutedForeground}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            No words found
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.mutedForeground,
              textAlign: "center",
            }}
          >
            Try searching for a different word
          </Text>
        </View>
      )}
    </View>
  );
}
