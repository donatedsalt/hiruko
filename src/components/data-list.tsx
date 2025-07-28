import React from "react";
import {
  IconCash,
  IconMoneybag,
  IconCaretDownFilled,
  IconCaretUpFilled,
} from "@tabler/icons-react";

import { ITransaction } from "@/types/transaction";

import { cn } from "@/lib/utils";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DataList({ data }: { data: ITransaction[] }) {
  return (
    <Tabs defaultValue="all" className="flex-col justify-start w-full gap-4">
      <div className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex flex-col px-4 lg:px-6">
        <ul>
          {data.map((item, index) => (
            <ListItem key={index} item={item} />
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="income" className="flex flex-col px-4 lg:px-6">
        <div className="flex-1 w-full border border-dashed rounded-lg aspect-video"></div>
      </TabsContent>
      <TabsContent value="expense" className="flex flex-col px-4 lg:px-6">
        <div className="flex-1 w-full border border-dashed rounded-lg aspect-video"></div>
      </TabsContent>
    </Tabs>
  );
}

export function ListItem({ item }: { item: ITransaction }) {
  return (
    <li className="flex items-center justify-between gap-2 py-4">
      <div className="flex items-center gap-2">
        <Avatar className="items-center justify-center bg-neutral-100 text-foreground size-12">
          <ListItemIcon item={item.type} />
        </Avatar>
        <div>
          <h3 className="font-semibold">{item.title || item.category}</h3>
          <Badge variant={"outline"}>{item.category}</Badge>
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
