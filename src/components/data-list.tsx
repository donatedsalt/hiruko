import Link from "next/link";
import {
  IconCash,
  IconMoneybag,
  IconCaretDownFilled,
  IconCaretUpFilled,
} from "@tabler/icons-react";

import type { Category, Transaction, TransactionGroups } from "@/types/convex";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TODO: use the already defined groupByDay convex function
function groupByDay(transactions: Transaction[]) {
  return transactions.reduce((groupedTransactions, transaction) => {
    const dateStr = new Date(transaction.transactionTime).toLocaleDateString();
    if (!groupedTransactions[dateStr]) groupedTransactions[dateStr] = [];
    groupedTransactions[dateStr].push(transaction);
    return groupedTransactions;
  }, {} as TransactionGroups);
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const monthDay = date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  if (isToday) return `Today, ${monthDay}`;
  if (isYesterday) return `Yesterday, ${monthDay}`;
  return `${weekday}, ${monthDay}`;
}

function RenderGroupedList({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: Category[];
}) {
  const grouped = groupByDay(transactions);
  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="grid gap-6">
      {dates.map((date) => (
        <div key={date}>
          <div className="py-3 text-xs font-semibold text-muted-foreground">
            {formatDisplayDate(date)}
          </div>
          <ul className="grid gap-4">
            {grouped[date].map((txn) => {
              const cat = categories.find((c) => c._id === txn.categoryId);
              if (!cat) return null;
              return <ListItem key={txn._id.toString()} txn={txn} cat={cat} />;
            })}
          </ul>
        </div>
      ))}
      <div className="grid py-12 place-items-center">
        <p>End of list 🫡</p>
      </div>
    </div>
  );
}

export function DataList({
  allData,
  incomeData,
  expenseData,
  categories,
  loading,
}: {
  allData: Transaction[];
  incomeData: Transaction[];
  expenseData: Transaction[];
  categories: Category[];
  loading?: boolean;
}) {
  if (loading) return <DataListSkeleton />;

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

      {/* All */}
      <TabsContent value="all" className="flex flex-col px-4 lg:px-6">
        {allData.length ? (
          <RenderGroupedList transactions={allData} categories={categories} />
        ) : (
          <EmptyState text="No transactions found. 😲" />
        )}
      </TabsContent>

      {/* Income */}
      <TabsContent value="income" className="flex flex-col px-4 lg:px-6">
        {incomeData.length ? (
          <RenderGroupedList
            transactions={incomeData}
            categories={categories}
          />
        ) : (
          <EmptyState text="No income found. 😬" />
        )}
      </TabsContent>

      {/* Expense */}
      <TabsContent value="expense" className="flex flex-col px-4 lg:px-6">
        {expenseData.length ? (
          <RenderGroupedList
            transactions={expenseData}
            categories={categories}
          />
        ) : (
          <EmptyState text="No expense found. 🤯" />
        )}
      </TabsContent>
    </Tabs>
  );
}

export function ListItem({ txn, cat }: { txn: Transaction; cat: Category }) {
  return (
    <li>
      <Link
        href={`/transactions/${txn._id.toString()}`}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Avatar className="items-center justify-center border size-12">
            {cat.icon || <ListItemIcon item={txn.type} />}
          </Avatar>
          <div>
            <h3 className="font-semibold">{txn.title || cat.name}</h3>
            {txn.title && <Badge variant={"outline"}>{cat.name}</Badge>}
          </div>
        </div>
        <p
          className={cn(
            "flex items-center text-lg font-semibold [&>svg]:size-4",
            txn.type === "income" ? "text-emerald-500" : "text-destructive"
          )}
        >
          {txn.type === "income" ? (
            <IconCaretUpFilled />
          ) : (
            <IconCaretDownFilled />
          )}
          {txn.amount}
        </p>
      </Link>
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid border border-dashed rounded-lg place-items-center aspect-video">
      <p className="text-xl font-semibold">{text}</p>
    </div>
  );
}

export function DataListSkeleton() {
  return (
    <div className="flex flex-col justify-start w-full gap-4 md:gap-6">
      <div className="px-4 lg:px-6">
        <Skeleton className="h-8 w-42" />
      </div>
      <div className="flex flex-col px-4 lg:px-6">
        <Skeleton className="w-32 h-4 my-3" />
        <ul className="grid gap-4">
          {[...Array(4)].map((_, i) => (
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
