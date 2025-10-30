"use client";

import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeChangeButton({
  isSidebarItem = false,
  className,
}: {
  isSidebarItem?: boolean;
  className?: string;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        {isSidebarItem ? (
          <SidebarMenuButton>
            <IconSun className="icon-sun h-[1.2rem] w-[1.2rem] dark:hidden" />
            <IconMoon className="icon-moon hidden h-[1.2rem] w-[1.2rem] dark:block" />
            <span>Change theme</span>
          </SidebarMenuButton>
        ) : (
          <Button variant={"outline"} size={"icon"}>
            <IconSun className="icon-sun h-[1.2rem] w-[1.2rem] dark:hidden" />
            <IconMoon className="icon-moon hidden h-[1.2rem] w-[1.2rem] dark:block" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("hiruko-light")}>
          Hiruko Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("hiruko-dark")}>
          Hiruko Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
