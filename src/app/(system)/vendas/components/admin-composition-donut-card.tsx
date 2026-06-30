"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { money } from "@/lib/format";
import type { SalesCompositionItem } from "./sales-dashboard-types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#94a3b8",
];

function percent(value: number, total: number) {
  if (!total) return "0%";

  return `${((value / total) * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatValue(value: number, valueType: "money" | "quantity") {
  if (valueType === "quantity") return String(value);
  return money(value);
}

export function AdminCompositionDonutCard({
  title,
  data,
  valueType = "money",
  centerLabel = "Total",
}: {
  title: string;
  data: SalesCompositionItem[];
  valueType?: "money" | "quantity";
  centerLabel?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
  const chartConfig = Object.fromEntries(
    chartData.map((item) => [
      item.key,
      {
        label: item.label,
        color: item.fill,
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-52"
          initialDimension={{ width: 208, height: 208 }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) =>
                    formatValue(Number(value), valueType)
                  }
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((item) => (
                <Cell key={item.key} fill={item.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-lg font-semibold"
            >
              {formatValue(total, valueType)}
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-xs"
            >
              {centerLabel}
            </text>
          </PieChart>
        </ChartContainer>

        <div className="grid gap-3">
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div key={item.key} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="font-medium">{percent(item.value, total)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum dado no mês selecionado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
