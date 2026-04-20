"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  IconCash,
  IconCategory2,
  IconChartPie,
  IconDeviceDesktop,
  IconLogout,
  IconMessageCircleQuestion,
  IconMoneybag,
  IconMoon,
  IconPigMoney,
  IconPlus,
  IconReport,
  IconSun,
} from "@tabler/icons-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandBar } from "@/components/command-bar-provider";

export function CommandBar() {
  const { isOpen, setOpen, close } = useCommandBar();
  const router = useRouter();
  const { setTheme } = useTheme();
  const clerk = useClerk();

  const run = (fn: () => void | Promise<void>) => {
    close();
    void fn();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => router.push("/"))}>
            <IconReport />
            Overview
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => router.push("/transactions"))}
          >
            <IconCash />
            Transactions
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/budgets"))}>
            <IconMoneybag />
            Budgets
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/goals"))}>
            <IconPigMoney />
            Goals
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/categories"))}>
            <IconCategory2 />
            Categories
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/statistics"))}>
            <IconChartPie />
            Statistics
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/consult"))}>
            <IconMessageCircleQuestion />
            Consult
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Create">
          <CommandItem
            onSelect={() => run(() => router.push("/transactions/new"))}
          >
            <IconPlus />
            New transaction
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => router.push("/budgets?new=1"))}
          >
            <IconPlus />
            New budget
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => router.push("/goals?new=1"))}
          >
            <IconPlus />
            New goal
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => router.push("/categories?new=1"))}
          >
            <IconPlus />
            New category
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Preferences">
          <CommandItem onSelect={() => run(() => setTheme("light"))}>
            <IconSun />
            Theme: Light
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("dark"))}>
            <IconMoon />
            Theme: Dark
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("system"))}>
            <IconDeviceDesktop />
            Theme: System
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() =>
              run(async () => {
                try {
                  await clerk.signOut({ redirectUrl: "/sign-in" });
                } catch (err) {
                  toast.error("Sign out failed", {
                    description:
                      err instanceof Error ? err.message : "Unknown error",
                  });
                }
              })
            }
          >
            <IconLogout />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
