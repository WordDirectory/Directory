import { create } from "zustand";

interface SidebarState {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isCollapsed: false,
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (value: boolean) => set({ isCollapsed: value }),
}));
