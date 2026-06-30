"use client";

import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { money } from "@/lib/format";
import type { SalesCompositionItem } from "./sales-dashboard-types";

const CHART_COLORS = [
  "#4f46e5",
  "#14b8a6",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#64748b",
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

function formatCenterValue(value: number, valueType: "money" | "quantity") {
  if (valueType === "quantity") return String(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value);
}

export function AdminCompositionDonutCard({
  title,
  data,
  valueType = "money",
  centerLabel = "Total",
  legendPosition = "side",
}: {
  title: string;
  data: SalesCompositionItem[];
  valueType?: "money" | "quantity";
  centerLabel?: string;
  legendPosition?: "side" | "bottom";
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
      <CardContent
        className={
          legendPosition === "bottom"
            ? "grid gap-3"
            : "grid gap-3 md:grid-cols-[240px_1fr] md:items-center"
        }
      >
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-56"
          initialDimension={{ width: 224, height: 224 }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatValue(Number(value), valueType)}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              innerRadius={64}
              outerRadius={98}
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
              {formatCenterValue(total, valueType)}
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

        <div
          className={
            legendPosition === "bottom"
              ? "flex flex-col gap-2 px-8"
              : "grid gap-3"
          }
        >
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 text-base text-muted-foreground"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="min-w-0 flex-1 leading-snug">
                  {item.label}
                </span>
                <span className="font-medium">
                  {percent(item.value, total)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-base text-muted-foreground">
              Nenhum dado no mês selecionado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
