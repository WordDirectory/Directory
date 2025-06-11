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

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();
  const isActive = (path: string) => pathname === path;

  // Single useEffect to handle all collapse logic
  useEffect(() => {
    // Default to collapsed until we know we're not on mobile
    if (isMobile === undefined) {
      setCollapsed(true);
      return;
    }

    setCollapsed(isMobile);
  }, [isMobile, setCollapsed]);

  const items = [
    {
      label: "General",
      href: "/settings",
    },
    {
      label: "Usage",
      href: "/settings/usage",
    },
  ];

  // Don't render anything until we know mobile state
  if (isMobile === undefined) {
    return null;
  }

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
          "bg-sidebar w-[20rem] h-dvh sticky top-16 border-r p-0 overflow-hidden transition-transform duration-300 ease-in-out",
          isCollapsed && "-translate-x-full",
          isMobile && "absolute top-0 left-0 z-50"
        )}
      >
        <nav className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground px-6">
              Settings
            </Label>
            {items.map((item) => (
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

export function SidebarToggle() {
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={toggleCollapse}
      size="icon"
      className="absolute top-8 left-12"
    >
      {isCollapsed ? <PanelLeft /> : <PanelRight />}
    </Button>
  );
}
