import { create } from "zustand";

interface AskAIStore {
  isOpen: boolean;
  initialMessage: string | null;
  setIsOpen: (isOpen: boolean) => void;
  setInitialMessage: (message: string | null) => void;
}

export const useAskAIStore = create<AskAIStore>((set) => ({
  isOpen: false,
  initialMessage: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setInitialMessage: (message) => set({ initialMessage: message }),
}));
