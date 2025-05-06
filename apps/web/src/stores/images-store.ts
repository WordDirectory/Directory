import { create } from 'zustand'

export const SHOW_IMAGES_KEY = "show-images-by-default";

// Simple mobile check - if window width is less than 768px
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

interface ImagesStore {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
  initializeFromPreference: () => void
}

export const useImagesStore = create<ImagesStore>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  initializeFromPreference: () => {
    if (typeof window === 'undefined') return;
    // Don't auto-show on mobile devices
    if (isMobileDevice()) return;
    const preference = localStorage.getItem(SHOW_IMAGES_KEY);
    if (preference === 'true') {
      set({ isOpen: true });
    }
  }
}))

