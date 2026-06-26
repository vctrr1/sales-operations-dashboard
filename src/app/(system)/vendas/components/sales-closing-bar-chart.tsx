"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { money } from "@/lib/format";
import type { SalesClosingChartItem } from "./sales-dashboard-types";

const chartConfig = {
  totalClosed: {
    label: "Fechado",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function compactMoney(value: number) {
  if (Math.abs(value) < 1000) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  const thousands = value / 1000;
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(thousands);

  return `${formatted} mil`;
}

export function SalesClosingBarChart({
  data,
}: {
  data: SalesClosingChartItem[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-64 w-full aspect-auto"
      initialDimension={{ width: 520, height: 256 }}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={76}
          tickFormatter={(value) => compactMoney(Number(value))}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => (
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {money(Number(value))}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="totalClosed" fill="var(--color-totalClosed)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
