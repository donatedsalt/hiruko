"use client";

import { useState } from "react";
import { Pie, PieChart } from "recharts";

import { Category } from "@/types/convex";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ChartPie({
  title,
  description,
  categories,
}: {
  title: string;
  description?: string;
  categories?: Category[];
}) {
  const [showPercent, setShowPercent] = useState(false);

  if (!categories) return <ChartPieSkeleton />;

  const total = categories.reduce((sum, cat) => sum + cat.transactionAmount, 0);

  const chartData = categories.map((cat, idx) => ({
    ...cat,
    fill: COLORS[idx % COLORS.length],
  }));

  const chartConfig = categories.reduce((acc, cat, idx) => {
    acc[cat.name] = {
      label: cat.name,
      color: COLORS[idx % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="transactionAmount" nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter
        className="flex-col gap-2"
        onClick={() => setShowPercent(!showPercent)}
      >
        {categories.map((cat, idx) => {
          const percent = ((cat.transactionAmount / total) * 100).toFixed(1);
          return (
            <div key={cat._id} className="flex justify-between w-full">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-xs size-4"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div>{cat.name}</div>
              </div>
              {showPercent ? (
                <div>{percent}%</div>
              ) : (
                <div>
                  {cat.transactionAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
              )}
            </div>
          );
        })}
        {!showPercent && (
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="rounded-xs size-4 bg-primary" />
              <div>Total</div>
            </div>
            <div>
              {total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export function ChartPieSkeleton() {
  return <Skeleton />;
}
