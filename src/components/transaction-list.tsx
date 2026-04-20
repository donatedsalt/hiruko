import { useMemo } from "react";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

import type { Id } from "@/convex/_generated/dataModel";
import type { Category, Transaction, TransactionGroups } from "@/types/convex";

import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ListItem, ListItemSkeleton } from "./list-item";

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

export function RenderGroupedList({
  transactions,
  categories,
  showEndMarker = true,
}: {
  transactions: Transaction[];
  categories: Category[];
  showEndMarker?: boolean;
}) {
  const categoriesById = useMemo(() => {
    const map = new Map<Id<"categories">, Category>();
    for (const c of categories) map.set(c._id, c);
    return map;
  }, [categories]);

  const grouped = useMemo(() => groupByDay(transactions), [transactions]);
  const dates = useMemo(
    () =>
      Object.keys(grouped).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      ),
    [grouped],
  );

  return (
    <div className="grid gap-6">
      {dates.map((date) => (
        <div key={date}>
          <div className="text-muted-foreground py-3 text-xs font-semibold">
            {formatDisplayDate(date)}
          </div>
          <ul className="grid gap-4">
            {grouped[date].map((txn) => {
              const cat = categoriesById.get(txn.categoryId);
              if (!cat) return null;
              return (
                <ListItem
                  key={txn._id.toString()}
                  href={`/transactions/${txn._id.toString()}`}
                  icon={cat.icon}
                  title={txn.title || cat.name}
                  badge={txn.title && cat.name}
                  amount={
                    <div
                      className={cn(
                        "flex items-center [&>svg]:size-4",
                        txn.type === "income"
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {txn.type === "income" ? (
                        <IconCaretUpFilled />
                      ) : (
                        <IconCaretDownFilled />
                      )}
                      {txn.amount}
                    </div>
                  }
                />
              );
            })}
          </ul>
        </div>
      ))}
      {showEndMarker && (
        <div className="grid place-items-center py-12">
          <p>End of list 🫡</p>
        </div>
      )}
    </div>
  );
}

export function TransactionList({
  allData,
  incomeData,
  expenseData,
  categories,
  loading,
  showEndMarker,
}: {
  allData: Transaction[];
  incomeData: Transaction[];
  expenseData: Transaction[];
  categories: Category[];
  loading?: boolean;
  showEndMarker?: boolean;
}) {
  if (loading) return <TransactionListSkeleton />;

  return (
    <Tabs
      defaultValue="all"
      className="w-full flex-col justify-start gap-4 md:gap-6"
    >
      <div>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
      </div>

      {/* All */}
      <TabsContent value="all" className="flex flex-col">
        {allData.length ? (
          <RenderGroupedList
            transactions={allData}
            categories={categories}
            showEndMarker={showEndMarker}
          />
        ) : (
          <EmptyState text="No transactions found. 😲" />
        )}
      </TabsContent>

      {/* Income */}
      <TabsContent value="income" className="flex flex-col">
        {incomeData.length ? (
          <RenderGroupedList
            transactions={incomeData}
            categories={categories}
            showEndMarker={showEndMarker}
          />
        ) : (
          <EmptyState text="No income found. 😬" />
        )}
      </TabsContent>

      {/* Expense */}
      <TabsContent value="expense" className="flex flex-col">
        {expenseData.length ? (
          <RenderGroupedList
            transactions={expenseData}
            categories={categories}
            showEndMarker={showEndMarker}
          />
        ) : (
          <EmptyState text="No expense found. 🤯" />
        )}
      </TabsContent>
    </Tabs>
  );
}

export function TransactionListSkeleton() {
  return (
    <div className="flex w-full flex-col justify-start gap-4 md:gap-6">
      <div>
        <Skeleton className="h-8 w-42" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="my-3 h-4 w-32" />
        <ul className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}
