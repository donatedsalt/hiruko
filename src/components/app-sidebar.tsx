"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconCash,
  IconChartCandle,
  IconCoin,
  IconHelp,
  IconMessageCircleQuestion,
  IconMoneybag,
  IconPigMoney,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavBusinesses } from "@/components/nav-businesses";
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
      title: "Budgets",
      url: "#",
      icon: IconMoneybag,
    },
    {
      title: "Goals",
      url: "#",
      icon: IconPigMoney,
    },
    {
      title: "Trade",
      url: "#",
      icon: IconChartCandle,
    },
    {
      title: "Consult",
      url: "#",
      icon: IconMessageCircleQuestion,
    },
  ],
  navBusinesses: [
    {
      name: "Business1",
      url: "#",
      icon: IconCoin,
    },
    {
      name: "Business2",
      url: "#",
      icon: IconCoin,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <Image
                  src={"/icons/icon.svg"}
                  width={100}
                  height={100}
                  className="!size-5"
                  alt="Icon"
                  unoptimized
                />
                <span className="text-base font-semibold">Hiruko</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavBusinesses items={data.navBusinesses} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
