import React from "react";
import {
  TouchableOpacity as RNTouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface Props extends Omit<TouchableOpacityProps, "activeOpacity"> {
  children: React.ReactNode;
  activeOpacity?: "none" | "sm" | "md" | "lg" | number;
}

function TouchableOpacity({ children, activeOpacity = "lg", ...props }: Props) {
  const opacity =
    typeof activeOpacity === "number"
      ? activeOpacity
      : activeOpacity === "none"
      ? 1
      : activeOpacity === "sm"
      ? 0.8
      : activeOpacity === "md"
      ? 0.7
      : 0.5;

  return (
    <RNTouchableOpacity activeOpacity={opacity} {...props}>
      {children}
    </RNTouchableOpacity>
  );
}

export default TouchableOpacity;
export { TouchableOpacity };
