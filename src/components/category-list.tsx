import { useEffect, useState } from "react";

import type { Category } from "@/types/convex";

import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDialog } from "@/components/category-dialog";
import { EmptyState, ListItem, ListItemSkeleton } from "@/components/list-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RenderList({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid gap-4">
      {categories.map((category) => {
        return (
          <CategoryDialog
            key={category._id.toString()}
            mode="edit"
            category={category}
            trigger={
              <div>
                <ListItem
                  icon={category.icon}
                  title={category.name}
                  badge={
                    <div
                      className={cn(
                        "flex items-center [&>svg]:size-4",
                        category.type === "income"
                          ? "text-emerald-500"
                          : "text-destructive"
                      )}
                    >
                      {category.type}
                    </div>
                  }
                  amount={category.transactionCount.toString()}
                />
              </div>
            }
          />
        );
      })}
    </ul>
  );
}

export function CategoryList({
  Data,
  loading,
}: {
  Data: Category[];
  loading?: boolean;
}) {
  const [incomeData, setIncomeData] = useState<Category[]>();
  const [expenseData, setExpenseData] = useState<Category[]>();

  useEffect(() => {
    if (loading) return;

    const incomeCat = Data.filter((cat) => cat.type === "income");
    const expenseCat = Data.filter((cat) => cat.type === "expense");

    setIncomeData(incomeCat);
    setExpenseData(expenseCat);
  }, [Data, loading]);

  if (loading) return <CategoryListSkeleton />;

  return (
    <Tabs
      defaultValue="all"
      className="flex-col justify-start w-full gap-4 md:gap-6"
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
        {Data.length ? (
          <RenderList categories={Data} />
        ) : (
          <EmptyState text="No categories found. 😲" />
        )}
      </TabsContent>

      {/* Income */}
      <TabsContent value="income" className="flex flex-col">
        {incomeData && incomeData.length ? (
          <RenderList categories={incomeData} />
        ) : (
          <EmptyState text="No income categories found. 😬" />
        )}
      </TabsContent>

      {/* Expense */}
      <TabsContent value="expense" className="flex flex-col">
        {expenseData && expenseData.length ? (
          <RenderList categories={expenseData} />
        ) : (
          <EmptyState text="No expense categories found. 🤯" />
        )}
      </TabsContent>
    </Tabs>
  );
}

export function CategoryListSkeleton() {
  return (
    <div className="flex flex-col justify-start w-full gap-4 md:gap-6">
      <div>
        <Skeleton className="h-8 w-42" />
      </div>
      <div>
        <ul className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}
