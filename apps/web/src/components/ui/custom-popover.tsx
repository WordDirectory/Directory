"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

export function CustomPopover({ children, trigger, className }: Props) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    // Position below and align right edge with trigger
    setPosition({
      top: triggerRect.bottom + window.scrollY + 8, // 8px gap
      left: Math.max(8, triggerRect.right - contentRect.width + window.scrollX),
    });
  };

  // Handle clicks outside
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking trigger or inside content, ignore
      if (
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      )
        return;

      // Store initial mouse position
      mouseStartPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      // If no start position or clicking trigger/content, ignore
      if (
        !mouseStartPosRef.current ||
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      ) {
        mouseStartPosRef.current = null;
        return;
      }

      // Calculate movement distance
      const dx = e.clientX - mouseStartPosRef.current.x;
      const dy = e.clientY - mouseStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only close if it was a click (minimal movement)
      if (distance <= 5) {
        setIsOpen(false);
      }

      mouseStartPosRef.current = null;
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen]);

  // Initial position
  useLayoutEffect(() => {
    if (!isMounted || !isOpen) return;

    // Run on next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      updatePosition();
    });
  }, [isMounted, isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isMounted || !isOpen) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isMounted, isOpen]);

  if (!isMounted) return null;

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer" }}
      >
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={contentRef}
            className={cn(
              "fixed z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
              className
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
