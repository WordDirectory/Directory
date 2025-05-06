import { create } from 'zustand'

export const SHOW_IMAGES_KEY = "show-images-by-default";

interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  user: {
    name: string;
    username: string;
  };
}

// Simple mobile check - if window width is less than 768px
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

interface ImagesStore {
  isOpen: boolean
  images: UnsplashImage[]
  isLoading: boolean
  error: string | null
  hasImages: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
  setImages: (images: UnsplashImage[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initializeFromPreference: () => void
  fetchImages: (word: string) => Promise<void>
}

// Create a cache to store images by word
const imageCache = new Map<string, UnsplashImage[]>();

export const useImagesStore = create<ImagesStore>((set, get) => ({
  isOpen: false,
  images: [],
  isLoading: false,
  error: null,
  hasImages: false,
  setIsOpen: (open) => set({ isOpen: open }),
  toggle: () => {
    const state = get();
    if (state.hasImages) {
      set({ isOpen: !state.isOpen });
    }
  },
  setImages: (images) => set({ images, hasImages: images.length > 0 }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  initializeFromPreference: () => {
    if (typeof window === 'undefined') return;
    // Don't auto-show on mobile devices
    if (isMobileDevice()) return;
    const preference = localStorage.getItem(SHOW_IMAGES_KEY);
    const state = get();
    if (preference === 'true' && state.hasImages) {
      set({ isOpen: true });
    }
  },
  fetchImages: async (word) => {
    const state = get();
    
    // Return cached images if available
    if (imageCache.has(word)) {
      const cachedImages = imageCache.get(word) || [];
      set({ images: cachedImages, hasImages: cachedImages.length > 0, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/words/${encodeURIComponent(word)}/images`);

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      imageCache.set(word, data.images);
      set({ 
        images: data.images,
        hasImages: data.images.length > 0,
        isLoading: false 
      });
    } catch (err) {
      console.error("Error fetching images:", err);
      set({ 
        error: "Failed to load images",
        isLoading: false,
        hasImages: false
      });
    }
  }
}))

