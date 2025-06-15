"use client";

import { useSensitivityStore } from "@/stores/sensitivity-store";
import { cn } from "@/lib/utils";

export function SensitivityBadge() {
  const { showBadge, badgeHiding, sensitivityLevel, formatSensitivityLabel } =
    useSensitivityStore();

  if (!showBadge) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "bg-foreground text-background px-2 py-1 rounded-md",
        "text-xs font-medium",
        "shadow-lg border",
        "transition-opacity duration-200 ease-out",
        badgeHiding ? "opacity-0" : "opacity-100"
      )}
    >
      Sensitivity: {sensitivityLevel}
    </div>
  );
}
