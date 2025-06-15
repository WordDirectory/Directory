import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SENSITIVITY_LEVEL_KEY,
  SENSITIVITY_LEVELS,
  DEFAULT_SENSITIVITY_LEVEL,
  type SensitivityLevel,
} from "@/lib/settings";

interface SensitivityState {
  sensitivityLevel: SensitivityLevel;
  showBadge: boolean;
  badgeHiding: boolean;
  badgeTimeoutId: NodeJS.Timeout | null;
  setSensitivityLevel: (level: SensitivityLevel) => void;
  cycleSensitivityLevel: () => void;
  formatSensitivityLabel: (level: SensitivityLevel) => string;
}

export const useSensitivityStore = create<SensitivityState>()(
  persist(
    (set, get) => ({
      sensitivityLevel: DEFAULT_SENSITIVITY_LEVEL,
      showBadge: false,
      badgeHiding: false,
      badgeTimeoutId: null,

      setSensitivityLevel: (level: SensitivityLevel) => {
        set({ sensitivityLevel: level });
      },

      cycleSensitivityLevel: () => {
        const { badgeTimeoutId } = get();

        // Clear existing timeout if there is one
        if (badgeTimeoutId) {
          clearTimeout(badgeTimeoutId);
        }

        const currentLevel = get().sensitivityLevel;
        const currentIndex = SENSITIVITY_LEVELS.indexOf(currentLevel);
        const nextIndex = (currentIndex + 1) % SENSITIVITY_LEVELS.length;
        const nextLevel = SENSITIVITY_LEVELS[nextIndex];

        // Set new timeout and store its ID
        const newTimeoutId = setTimeout(() => {
          // Start fade out animation
          set({ badgeHiding: true });

          // After animation completes, hide badge completely
          setTimeout(() => {
            set({ showBadge: false, badgeHiding: false, badgeTimeoutId: null });
          }, 200); // Match the fade out duration
        }, 3000);

        set({
          sensitivityLevel: nextLevel,
          showBadge: true,
          badgeHiding: false,
          badgeTimeoutId: newTimeoutId,
        });
      },

      formatSensitivityLabel: (level: SensitivityLevel) => {
        switch (level) {
          case 0:
            return "Safe";
          case 0.5:
            return "Standard";
          case 1:
            return "All";
          default:
            return "Standard";
        }
      },
    }),
    {
      name: SENSITIVITY_LEVEL_KEY,
      partialize: (state) => ({ sensitivityLevel: state.sensitivityLevel }),
    }
  )
);
