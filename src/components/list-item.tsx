import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ListItemProps {
  href?: string;
  icon: React.ReactNode | string;
  title: string;
  badge?: string;
  amount?: React.ReactNode | string;
}

export function ListItem({ href, icon, title, badge, amount }: ListItemProps) {
  if (href) {
    return (
      <li>
        <Link href={href} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="items-center justify-center border size-12">
              {icon}
            </Avatar>
            <div>
              <h3 className="font-semibold">{title}</h3>
              {badge && <Badge variant={"outline"}>{badge}</Badge>}
            </div>
          </div>
          {amount && <div className="text-lg font-semibold">{amount}</div>}
        </Link>
      </li>
    );
  } else {
    return (
      <li className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="items-center justify-center border size-12">
            {icon}
          </Avatar>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {badge && <Badge variant={"outline"}>{badge}</Badge>}
          </div>
        </div>
        {amount && <div className="text-lg font-semibold">{amount}</div>}
      </li>
    );
  }
}

export function ListItemSkeleton() {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="rounded-full size-12" />
        <div className="grid gap-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
      <Skeleton className="w-16 h-6" />
    </li>
  );
}
