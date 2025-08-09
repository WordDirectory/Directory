import React, { useState } from "react";
import { Text, View, ScrollView, Alert, StatusBar } from "react-native";
import { TouchableOpacity } from "../../src/components/touchable-opacity";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../lib/theme-store";
import { Link, Href } from "expo-router";

interface ProfileRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "default" | "destructive";
  showSeparator?: boolean;
  href?: Href;
}

function ProfileRow({
  title,
  subtitle,
  onPress,
  rightElement,
  icon,
  variant = "default",
  showSeparator = false,
  href,
}: ProfileRowProps) {
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
    paddingHorizontal: 8,
    paddingVertical: 14,
    minHeight: 44,
  };

  if (href) {
    const rowContent = (
      <Link href={href} asChild>
        <TouchableOpacity style={containerStyle}>{content}</TouchableOpacity>
      </Link>
    );

    return (
      <>
        {rowContent}
        {showSeparator && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginHorizontal: 20,
            }}
          />
        )}
      </>
    );
  }

  const rowContent = onPress ? (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={containerStyle}>{content}</View>
  );

  return (
    <>
      {rowContent}
      {showSeparator && (
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 20,
          }}
        />
      )}
    </>
  );
}

interface ProfileGroupProps {
  title?: string;
  children: React.ReactNode;
}

function ProfileGroup({ title, children }: ProfileGroupProps) {
  const { colors } = useTheme();

  return (
    <View>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.mutedForeground,
            marginLeft: 20,
            marginBottom: 8,
            paddingHorizontal: 8,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          marginHorizontal: 20,
          borderRadius: 12,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 20, paddingBottom: 40 }}>
          {/* User Info */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.primaryForeground,
                  }}
                >
                  M
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 4,
                }}
              >
                Maze
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.mutedForeground,
                }}
              >
                maze@example.com
              </Text>
            </View>
          </View>

          <View style={{ gap: 16, marginTop: 16 }}>
            <ProfileGroup title="Account">
              <ProfileRow
                title="Edit Profile"
                onPress={() => console.log("Edit profile")}
                icon="person-outline"
              />
              <ProfileRow
                title="Saved Words"
                subtitle="View your saved definitions"
                href="/saved"
                icon="bookmark-outline"
              />
              <ProfileRow
                title="Privacy Settings"
                onPress={() => console.log("Privacy")}
                icon="shield-outline"
              />
            </ProfileGroup>

            <ProfileGroup title="App">
              <ProfileRow
                title="Settings"
                subtitle="App preferences and configuration"
                href="/settings"
                icon="settings-outline"
              />
            </ProfileGroup>

            {/* Separator between App and Sign Out */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginHorizontal: 30,
                marginVertical: 0,
              }}
            />

            <ProfileGroup>
              <ProfileRow
                title="Sign Out"
                onPress={() => {
                  Alert.alert(
                    "Sign Out",
                    "Are you sure you want to sign out?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Sign Out", style: "destructive" },
                    ]
                  );
                }}
                variant="destructive"
                icon="log-out-outline"
              />
            </ProfileGroup>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
