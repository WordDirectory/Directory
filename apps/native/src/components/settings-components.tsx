import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "./touchable-opacity";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";
import { Link, Href } from "expo-router";

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
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
  href?: Href;
  showArrow?: boolean;
}

export function SettingsRow({
  title,
  subtitle,
  onPress,
  rightElement,
  icon,
  isLast = false,
  variant = "default",
  href,
  showArrow = true,
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

      {(showArrow) && !rightElement && (
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
    paddingVertical: 12,
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
