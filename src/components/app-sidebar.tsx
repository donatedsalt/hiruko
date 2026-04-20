"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCash,
  IconCategory2,
  IconChartPie,
  IconMessageCircleQuestion,
  IconMoneybag,
  IconPigMoney,
  IconReport,
  IconSearch,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCommandBar } from "@/components/command-bar-provider";

import HirukoIcon from "@/components/icons/hiruko-icon";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconReport,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: IconCash,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: IconCategory2,
    },
    {
      title: "Statistics",
      url: "/statistics",
      icon: IconChartPie,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: IconMoneybag,
    },
    {
      title: "Goals",
      url: "/goals",
      icon: IconPigMoney,
    },
    {
      title: "Consult",
      url: "/consult",
      icon: IconMessageCircleQuestion,
    },
  ],
  navSecondary: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open: openCommandBar } = useCommandBar();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              asChild
            >
              <Link href="/">
                <HirukoIcon className="!size-5" />
                <span className="text-base font-semibold">Hiruko</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={openCommandBar}
              aria-label="Open command bar"
            >
              <IconSearch />
              <span>Search</span>
              <kbd className="bg-muted text-muted-foreground ml-auto inline-flex items-center gap-0.5 rounded border px-1.5 font-mono text-[10px]">
                <span>⌘</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
