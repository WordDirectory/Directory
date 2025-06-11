// Generic utilities

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getFirstLetter(text: string) {
  return text.charAt(0).toUpperCase();
}

export const AVATAR_COLORS: Record<string, string> = {
  A: "bg-red-500",
  B: "bg-orange-500",
  C: "bg-amber-500",
  D: "bg-yellow-500",
  E: "bg-lime-500",
  F: "bg-green-500",
  G: "bg-emerald-500",
  H: "bg-teal-500",
  I: "bg-cyan-500",
  J: "bg-sky-500",
  K: "bg-blue-500",
  L: "bg-indigo-500",
  M: "bg-violet-500",
  N: "bg-purple-500",
  O: "bg-fuchsia-500",
  P: "bg-pink-500",
  Q: "bg-rose-500",
  R: "bg-red-600",
  S: "bg-orange-600",
  T: "bg-amber-600",
  U: "bg-yellow-600",
  V: "bg-lime-600",
  W: "bg-green-600",
  X: "bg-emerald-600",
  Y: "bg-teal-600",
  Z: "bg-cyan-600",
};

export function getLetterColor(text: string): string {
  const letter = getFirstLetter(text);
  return AVATAR_COLORS[letter] || "bg-gray-500";
}
