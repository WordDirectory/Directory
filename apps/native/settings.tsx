import React, { useState } from "react";
import { Text, View, ScrollView, Switch, Alert, StatusBar } from "react-native";
import { TouchableOpacity } from "../src/components/touchable-opacity";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme, useThemeActions } from "../lib/theme-store";
import { ThemeMode } from "../lib/colors";
import { Link } from "expo-router";

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  const { colors } = useTheme();

  return (
    <View style={{ marginTop: title ? 32 : 16 }}>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.mutedForeground,
            marginLeft: 28,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: colors.card,
          marginHorizontal: 20,
          borderRadius: 12,
        }}
      >
        {children}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
  variant?: "default" | "destructive";
  href?: string;
}

function SettingsRow({
  title,
  subtitle,
  onPress,
  rightElement,
  icon,
  isLast = false,
  variant = "default",
  href,
}: SettingsRowProps) {
  const { colors } = useTheme();

  const content = (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={
              variant === "destructive" ? colors.destructive : colors.primary
            }
            style={{ marginRight: 12 }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              color:
                variant === "destructive"
                  ? colors.destructive
                  : colors.foreground,
              marginBottom: subtitle ? 2 : 0,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 13,
                color: colors.mutedForeground,
                lineHeight: 16,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightElement && <View style={{ marginLeft: 12 }}>{rightElement}</View>}

      {(onPress || href) && !rightElement && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.mutedForeground}
        />
      )}
    </>
  );

  const containerStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingTop: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  };

  if (href) {
    return (
      <Link href={href} asChild>
        <TouchableOpacity style={containerStyle}>{content}</TouchableOpacity>
      </Link>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={containerStyle}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

export default function SettingsScreen() {
  const { colors, isDark, themeMode } = useTheme();
  const { setThemeMode } = useThemeActions();

  // Settings state
  const [showImages, setShowImages] = useState(true);
  const [smartImageOpen, setSmartImageOpen] = useState("smart");
  const [hearExamplesBehavior, setHearExamplesBehavior] =
    useState("hear-examples");
  const [showRandomWords, setShowRandomWords] = useState(true);
  const [sensitivityLevel, setSensitivityLevel] = useState("0.5");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [wordOfTheDay, setWordOfTheDay] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(newTheme as ThemeMode);
  };

  const showThemeOptions = () => {
    Alert.alert("Theme", "Choose your preferred theme", [
      { text: "Light", onPress: () => handleThemeChange("light") },
      { text: "Dark", onPress: () => handleThemeChange("dark") },
      { text: "System", onPress: () => handleThemeChange("system") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showImageOptions = () => {
    Alert.alert("Smart Image Display", "Control when images are shown", [
      { text: "Smart (AI decides)", onPress: () => setSmartImageOpen("smart") },
      { text: "Always show", onPress: () => setSmartImageOpen("always") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

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

  const showSensitivityOptions = () => {
    Alert.alert("Content Sensitivity", "Choose content filter level", [
      { text: "Family Safe", onPress: () => setSensitivityLevel("0") },
      { text: "Moderate", onPress: () => setSensitivityLevel("0.5") },
      { text: "Show All", onPress: () => setSensitivityLevel("1") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const getImageLabel = () => (smartImageOpen === "smart" ? "Smart" : "Always");
  const getAudioLabel = () =>
    hearExamplesBehavior === "hear-examples" ? "Built-in" : "YouGlish";
  const getSensitivityLabel = () => {
    switch (sensitivityLevel) {
      case "0":
        return "Family Safe";
      case "0.5":
        return "Moderate";
      case "1":
        return "Show All";
      default:
        return "Moderate";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 0, paddingBottom: 28 }}>
          <SettingsGroup title="Appearance">
            <SettingsRow
              title="Theme"
              subtitle={getThemeLabel()}
              onPress={showThemeOptions}
              icon="contrast"
            />
          </SettingsGroup>

          <SettingsGroup title="Images">
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
                subtitle={getImageLabel()}
                onPress={showImageOptions}
                isLast
              />
            )}
          </SettingsGroup>

          <SettingsGroup title="Audio">
            <SettingsRow
              title="Pronunciation"
              subtitle={getAudioLabel()}
              onPress={showAudioOptions}
              icon="volume-high"
            />
          </SettingsGroup>

          <SettingsGroup title="Search">
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
            />
          </SettingsGroup>

          <SettingsGroup title="Content">
            <SettingsRow
              title="Sensitivity Filter"
              subtitle={getSensitivityLabel()}
              onPress={showSensitivityOptions}
              icon="shield-checkmark"
            />
          </SettingsGroup>

          <SettingsGroup title="Notifications">
            <SettingsRow
              title="Push Notifications"
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{
                    false: colors.muted,
                    true: colors.primary + "40",
                  }}
                  thumbColor={
                    pushNotifications ? colors.primary : colors.mutedForeground
                  }
                />
              }
              icon="notifications"
            />
            <SettingsRow
              title="Word of the Day"
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

          <SettingsGroup title="Support">
            <SettingsRow
              title="Rate App"
              onPress={() => console.log("Rate app")}
              icon="star"
            />
            <SettingsRow
              title="Share App"
              onPress={() => console.log("Share app")}
            />
            <SettingsRow
              title="Contact Support"
              onPress={() => console.log("Contact support")}
              isLast
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              title="Clear All Data"
              onPress={() => {
                Alert.alert(
                  "Clear Data",
                  "This will remove all saved words and reset settings.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive" },
                  ]
                );
              }}
              variant="destructive"
              icon="trash"
            />
            <SettingsRow
              title="Delete Account"
              onPress={() => {
                Alert.alert("Delete Account", "This action cannot be undone.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive" },
                ]);
              }}
              variant="destructive"
              icon="person-remove"
              isLast
            />
          </SettingsGroup>
        </View>
      </ScrollView>
    </View>
  );
}
