import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { FloatingButtons } from "@/components/floating-buttons";
import { HistoryTracker } from "@/components/history-tracker";
import { CommandBarProvider } from "@/components/command-bar-provider";
import { CommandBar } from "@/components/command-bar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommandBarProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <CommandBar />
      <Toaster />
      <FloatingButtons />
      <HistoryTracker />
      <SpeedInsights />
    </CommandBarProvider>
  );
}
