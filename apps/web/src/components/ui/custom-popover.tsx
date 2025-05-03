"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CustomPopover({
  children,
  trigger,
  className,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setUncontrolledOpen(newOpen);
    }
  };

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
      if (
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      )
        return;

      mouseStartPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (
        !mouseStartPosRef.current ||
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      ) {
        mouseStartPosRef.current = null;
        return;
      }

      const dx = e.clientX - mouseStartPosRef.current.x;
      const dy = e.clientY - mouseStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 5) {
        setIsOpen(false);
      }

      mouseStartPosRef.current = null;
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, setIsOpen]);

  // Initial position calculation
  useLayoutEffect(() => {
    if (!isMounted || !isOpen) return;

    // Create a hidden div to measure dimensions
    const tempDiv = document.createElement("div");
    tempDiv.style.visibility = "hidden";
    tempDiv.style.position = "fixed";
    tempDiv.style.width = "18rem"; // w-72 = 18rem
    tempDiv.className = cn(
      "fixed z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
      className
    );
    document.body.appendChild(tempDiv);

    // Calculate initial position
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (triggerRect) {
      const contentWidth = tempDiv.getBoundingClientRect().width;
      setPosition({
        top: triggerRect.bottom + window.scrollY + 8,
        left: Math.max(8, triggerRect.right - contentWidth + window.scrollX),
      });
    }

    // Clean up
    document.body.removeChild(tempDiv);
  }, [isMounted, isOpen, className]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isMounted) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isMounted]);

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
      {position &&
        createPortal(
          <AnimatePresence mode="wait" onExitComplete={() => setPosition(null)}>
            {isOpen && (
              <motion.div
                ref={contentRef}
                className={cn(
                  "fixed z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                  className
                )}
                style={{
                  top: position.top,
                  left: position.left,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.5,
                }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
