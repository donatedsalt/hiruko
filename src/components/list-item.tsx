import { memo } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ListItemProps {
  href?: string;
  icon: React.ReactNode | string;
  title: string;
  badge?: React.ReactNode | string;
  amount?: React.ReactNode | string;
}

const itemRowClass =
  "flex items-center justify-between gap-2 -mx-2 px-2 py-1 rounded-md cursor-pointer transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ItemBody({ icon, title, badge, amount }: Omit<ListItemProps, "href">) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar className="size-12 items-center justify-center border">
          {icon}
        </Avatar>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {badge && <Badge variant={"outline"}>{badge}</Badge>}
        </div>
      </div>
      {amount && <div className="text-lg font-semibold">{amount}</div>}
    </>
  );
}

function ListItemInner({ href, icon, title, badge, amount }: ListItemProps) {
  if (href) {
    return (
      <li>
        <Link href={href} className={itemRowClass}>
          <ItemBody icon={icon} title={title} badge={badge} amount={amount} />
        </Link>
      </li>
    );
  }
  return (
    <li className={itemRowClass} tabIndex={0}>
      <ItemBody icon={icon} title={title} badge={badge} amount={amount} />
    </li>
  );
}

export const ListItem = memo(ListItemInner);

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid aspect-video place-items-center rounded-lg border border-dashed">
      <p className="text-xl font-semibold">{text}</p>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-12 rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </li>
  );
}
