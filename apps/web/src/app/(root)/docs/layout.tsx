import { Sidebar, SidebarToggle } from "./sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex relative">
      <Sidebar />
      <div className="relative w-full overflow-hidden px-8">
        <div className="container mx-auto max-w-4xl py-8 space-y-12">
          <SidebarToggle />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
