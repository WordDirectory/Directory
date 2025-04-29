"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      className,
      minRows = 1,
      maxRows = 10,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [textareaValue, setTextareaValue] = React.useState(
      value || defaultValue || ""
    );

    // Merge refs
    const handleRef = React.useCallback(
      (textarea: HTMLTextAreaElement | null) => {
        textareaRef.current = textarea;
        if (typeof ref === "function") {
          ref(textarea);
        } else if (ref) {
          ref.current = textarea;
        }
      },
      [ref]
    );

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate line height based on the font size
      const lineHeight =
        Number.parseInt(getComputedStyle(textarea).lineHeight) || 24;

      // Calculate min and max heights
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      // Set the height based on scrollHeight, but constrained by min and max
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );

      textarea.style.height = `${newHeight}px`;

      // Add overflow if content exceeds max height
      textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [minRows, maxRows]);

    // Adjust height on value change
    React.useEffect(() => {
      adjustHeight();
    }, [textareaValue, adjustHeight]);

    // Adjust height on window resize
    React.useEffect(() => {
      const handleResize = () => adjustHeight();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        ref={handleRef}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        rows={minRows}
        className={cn(
          "flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ overflow: "hidden" }}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";
