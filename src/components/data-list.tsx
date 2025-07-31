import {
  IconCash,
  IconMoneybag,
  IconCaretDownFilled,
  IconCaretUpFilled,
} from "@tabler/icons-react";

import { ITransaction } from "@/types/transaction";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DataList({
  allData,
  incomeData,
  expenseData,
}: {
  allData: ITransaction[];
  incomeData: ITransaction[];
  expenseData: ITransaction[];
}) {
  return (
    <Tabs
      defaultValue="all"
      className="flex-col justify-start w-full gap-4 md:gap-6"
    >
      <div className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex flex-col px-4 lg:px-6">
        <ul className="grid gap-4">
          {allData.length ? (
            allData.map((item, index) => <ListItem key={index} item={item} />)
          ) : (
            <div className="grid border border-dashed rounded-lg place-items-center aspect-video">
              <p className="text-xl font-semibold">No transactions found. 😲</p>
            </div>
          )}
        </ul>
      </TabsContent>
      <TabsContent value="income" className="flex flex-col px-4 lg:px-6">
        <ul className="grid gap-4">
          {incomeData.length ? (
            incomeData.map((item, index) => (
              <ListItem key={index} item={item} />
            ))
          ) : (
            <div className="grid border border-dashed rounded-lg place-items-center aspect-video">
              <p className="text-xl font-semibold">No income found. 😬</p>
            </div>
          )}
        </ul>
      </TabsContent>
      <TabsContent value="expense" className="flex flex-col px-4 lg:px-6">
        <ul className="grid gap-4">
          {expenseData.length ? (
            expenseData.map((item, index) => (
              <ListItem key={index} item={item} />
            ))
          ) : (
            <div className="grid border border-dashed rounded-lg place-items-center aspect-video">
              <p className="text-xl font-semibold">No expense found. 🤯</p>
            </div>
          )}
        </ul>
      </TabsContent>
    </Tabs>
  );
}

export function ListItem({ item }: { item: ITransaction }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="items-center justify-center border size-12">
          <ListItemIcon item={item.type} />
        </Avatar>
        <div>
          <h3 className="font-semibold">{item.title || item.category}</h3>
          {item.title && <Badge variant={"outline"}>{item.category}</Badge>}
        </div>
      </div>
      <p
        className={cn(
          "flex items-center text-lg font-semibold [&>svg]:size-4",
          item.type === "income" ? "text-green-500" : "text-red-500"
        )}
      >
        {item.type === "income" ? (
          <IconCaretUpFilled />
        ) : (
          <IconCaretDownFilled />
        )}
        {item.amount}
      </p>
    </li>
  );
}

function ListItemIcon({ item }: { item: string }) {
  switch (item) {
    case "income":
      return <IconCash />;
    case "expense":
      return <IconMoneybag />;
    default:
      return null;
  }
}

export function DataListSkeleton() {
  return (
    <div className="flex flex-col justify-start w-full gap-4 md:gap-6">
      <div className="px-4 lg:px-6">
        <Skeleton className="h-8 w-42" />
      </div>
      <div className="flex flex-col px-4 lg:px-6">
        <ul className="grid gap-4">
          {[...Array(12)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
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
