"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Transaction } from "@/types/convex";

import { useIsMobile } from "@/hooks/use-mobile";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ChartAreaInteractive({ data }: { data: Transaction[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Prepare chart data with running balance
  const chartData = React.useMemo(() => {
    // Group by date (YYYY-MM-DD)
    const grouped: Record<string, { income: number; expense: number }> = {};
    data.forEach((transaction) => {
      const date = new Date(transaction.transactionTime)
        .toISOString()
        .split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { income: 0, expense: 0 };
      }
      if (transaction.type === "income") {
        grouped[date].income += transaction.amount;
      } else {
        grouped[date].expense += transaction.amount;
      }
    });
    // Convert to array and sort by date
    const sorted = Object.entries(grouped)
      .map(([date, { income, expense }]) => ({
        date,
        income,
        expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance
    let balance = 0;
    return sorted.map((item) => {
      balance += item.income - item.expense;
      return { ...item, balance };
    });
  }, [data]);

  // Filter by time range
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return [];
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 30;
    if (timeRange === "7d") daysToSubtract = 7;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange]);

  const chartConfig = {
    transactions: { label: "Transactions" },
    income: { label: "Income", color: "var(--secondary)" },
    expense: { label: "Expense", color: "var(--destructive)" },
    balance: { label: "Balance", color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Your Transaction History
            </span>
            <span className="@[540px]/card:hidden">Transaction History</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                {/* <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-secondary, #22c55e)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-secondary, #22c55e)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-destructive, #ef4444)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-destructive, #ef4444)"
                  stopOpacity={0.1}
                />
              </linearGradient> */}
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary, #000)"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary, #000)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 10}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {/* <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-secondary, #22c55e)"
              stackId="a"
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              stroke="var(--color-destructive, #ef4444)"
              stackId="a"
            /> */}
              <Area
                dataKey="balance"
                type="monotone"
                fill="url(#fillBalance)"
                stroke="var(--color-primary, #000)"
                dot={false}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function ChartAreaInteractiveSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <Skeleton className=" h-98" />
    </div>
  );
}
