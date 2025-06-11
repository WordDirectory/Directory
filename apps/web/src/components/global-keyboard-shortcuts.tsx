"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function GlobalKeyboardShortcuts() {
  const pathname = usePathname();

  useEffect(() => {
    console.log(
      "GlobalKeyboardShortcuts: Setting up event listeners for pathname:",
      pathname
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("GlobalKeyboardShortcuts: Key pressed:", event.key, {
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        target: event.target,
        isTypingInInput: isTypingInInput(event.target as Element),
      });

      // Handle forward slash (/) - the universal search key
      if (event.key === "/" && !isTypingInInput(event.target as Element)) {
        console.log(
          "GlobalKeyboardShortcuts: Forward slash triggered, preventing default and focusing search"
        );
        event.preventDefault();
        focusSearchInput();
        return;
      }

      // Also handle Ctrl+K or Cmd+K as secondary shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        console.log(
          "GlobalKeyboardShortcuts: Ctrl/Cmd+K triggered, preventing default and focusing search"
        );
        event.preventDefault();
        focusSearchInput();
        return;
      }
    };

    const focusSearchInput = () => {
      console.log(
        "GlobalKeyboardShortcuts: focusSearchInput called for pathname:",
        pathname
      );

      // If on home page, focus hero search
      if (pathname === "/") {
        console.log(
          "GlobalKeyboardShortcuts: Dispatching openHeroSearch event"
        );
        window.dispatchEvent(new CustomEvent("openHeroSearch"));
      } else {
        console.log(
          "GlobalKeyboardShortcuts: Dispatching openHeaderSearch event"
        );
        // For all other pages, focus header search
        window.dispatchEvent(new CustomEvent("openHeaderSearch"));
      }
    };

    const isTypingInInput = (target: Element): boolean => {
      if (!target) return false;

      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === "input" || tagName === "textarea";
      const isContentEditable = target.hasAttribute("contenteditable");

      return isInput || isContentEditable;
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
