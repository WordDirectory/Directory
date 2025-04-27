"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "./store";
import { PanelLeft, PanelRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

/**
 * Renders a responsive sidebar navigation for documentation, with sections for consumers and developers.
 *
 * The sidebar automatically collapses on route changes and adapts its state based on device type. On mobile devices, an overlay appears when the sidebar is expanded, allowing users to collapse it by clicking outside.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    console.log("pathname", pathname);
    setCollapsed(true);
  }, [pathname]);

  // Set initial collapsed state based on mobile
  useEffect(() => {
    setCollapsed(!!isMobile);
  }, [isMobile, setCollapsed]);

  const consumerItems = [
    {
      label: "Getting started",
      href: "/docs",
    },
  ];

  const developerItems = [
    {
      label: "API Routes",
      href: "/docs/developers/api-routes",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "bg-sidebar w-[20rem] h-dvh sticky top-14 border-r p-0 overflow-hidden transition-transform duration-300 ease-in-out",
          isCollapsed && "-translate-x-full",
          isMobile && "absolute top-0 left-0 z-50"
        )}
      >
        <nav className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground px-6">
              For consumers
            </Label>
            {consumerItems.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground px-6">
              For developers
            </Label>
            {developerItems.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

/**
 * Renders a sidebar navigation link with active state styling.
 *
 * @param label - The text label to display for the navigation item.
 * @param href - The destination URL for the navigation link.
 * @param isActive - Whether the navigation item is currently active.
 */
function SidebarItem({
  label,
  href,
  isActive,
}: {
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-transparent hover:bg-sidebar-accent/50 text-sm p-2 px-3 mx-3 rounded-lg",
        isActive && "!bg-sidebar-accent"
      )}
    >
      <p>{label}</p>
    </Link>
  );
}

/**
 * Renders a button that toggles the sidebar's collapsed state.
 *
 * Displays a left or right panel icon depending on whether the sidebar is currently collapsed.
 */
export function SidebarToggle() {
  const { isCollapsed, toggleCollapse } = useSidebarStore();

  return (
    <Button variant="outline" onClick={toggleCollapse} size="icon">
      {isCollapsed ? <PanelLeft /> : <PanelRight />}
    </Button>
  );
}
