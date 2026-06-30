import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money, percent } from "@/lib/format";
import { SalesClosingBarChart } from "./sales-closing-bar-chart";
import type {
  SalesClosingChartItem,
  SalesDashboardMetric,
} from "./sales-dashboard-types";
import {
  Percent,
  DollarSign,
  ReceiptText,
  Calculator,
  type LucideIcon,
} from "lucide-react";

type MetricHelper = {
  value: string;
  suffix: string;
  tone: "positive" | "negative" | "neutral";
};

function SellerMetricCard({
  title,
  value,
  helper,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
}: {
  title: string;
  value: string;
  helper: MetricHelper;
  icon?: LucideIcon;
  iconClassName?: string;
  iconContainerClassName?: string;
}) {
  return (
    <Card size="sm" className="border-border/70 shadow-sm">
      <CardContent className="flex justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-base font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-muted-foreground">
            <span
              className={cn(
                helper.tone === "positive" && "text-emerald-500",
                helper.tone === "negative" && "text-destructive",
                helper.tone === "neutral" && "text-muted-foreground",
              )}
            >
              {helper.value}
            </span>{" "}
            {helper.suffix}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              iconContainerClassName,
            )}
          >
            <Icon className={cn("size-5", iconClassName)} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function GoalLevel({
  label,
  amount,
  active,
  iconSrc,
}: {
  label: string;
  amount: number;
  active: boolean;
  iconSrc: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t py-3 text-base">
      <div className="flex items-center gap-2 font-medium">
        <Image
          src={iconSrc}
          alt=""
          width={32}
          height={32}
          className={active ? "opacity-100" : "opacity-30"}
        />
        <span>{label}</span>
      </div>
      <span className="text-muted-foreground">{money(amount)}</span>
    </div>
  );
}

export function SalesSellerDashboard({
  metric,
  previousMetric,
  hasOrders,
  closingChartData,
}: {
  metric: SalesDashboardMetric;
  previousMetric: SalesDashboardMetric;
  hasOrders: boolean;
  closingChartData: SalesClosingChartItem[];
}) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  function countDelta(current: number, previous: number): MetricHelper {
    const difference = current - previous;
    if (difference === 0) {
      return {
        value: "Igual",
        suffix: "ao período anterior",
        tone: "neutral",
      };
    }

    return {
      value: `${difference > 0 ? "+" : ""}${difference}`,
      suffix: "vs. período anterior",
      tone: difference > 0 ? "positive" : "negative",
    } satisfies MetricHelper;
  }

  function percentDelta(current: number, previous: number): MetricHelper {
    if (!previous) {
      return {
        value: "Sem base",
        suffix: "no período anterior",
        tone: "neutral",
      };
    }

    const difference = ((current - previous) / previous) * 100;
    return {
      value: `${difference > 0 ? "+" : ""}${percent(difference)}`,
      suffix: "vs. período anterior",
      tone:
        difference === 0 ? "neutral" : difference > 0 ? "positive" : "negative",
    } satisfies MetricHelper;
  }

  function pointDelta(current: number, previous: number): MetricHelper {
    const difference = current - previous;
    if (difference === 0) {
      return {
        value: "Igual",
        suffix: "ao período anterior",
        tone: "neutral",
      };
    }

    return {
      value: `${difference > 0 ? "+" : ""}${percent(difference)} p.p.`,
      suffix: "vs. período anterior",
      tone: difference > 0 ? "positive" : "negative",
    } satisfies MetricHelper;
  }

  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SellerMetricCard
          title="Total Orçado"
          value={money(metric.totalQuoted)}
          helper={percentDelta(metric.totalQuoted, previousMetric.totalQuoted)}
          icon={DollarSign}
          iconContainerClassName="bg-emerald-400/20"
          iconClassName="text-emerald-500"
        />
        <SellerMetricCard
          title="Total Fechado"
          value={money(metric.totalClosed)}
          helper={percentDelta(metric.totalClosed, previousMetric.totalClosed)}
          icon={ReceiptText}
          iconContainerClassName="bg-sky-400/20"
          iconClassName="text-sky-500"
        />
        <SellerMetricCard
          title="Taxa de Conversão (nº)"
          value={percent(metric.conversionCount)}
          helper={pointDelta(
            metric.conversionCount,
            previousMetric.conversionCount,
          )}
          icon={Percent}
          iconContainerClassName="bg-violet-400/20"
          iconClassName="text-violet-500"
        />
        <SellerMetricCard
          title="Ticket Médio"
          value={money(metric.ticket)}
          helper={percentDelta(metric.ticket, previousMetric.ticket)}
          icon={Calculator}
          iconContainerClassName="bg-amber-400/20"
          iconClassName="text-amber-500"
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(280px,0.45fr)_minmax(0,1fr)]">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
          <SellerMetricCard
            title="Orçamentos"
            value={String(metric.quoteCount)}
            helper={countDelta(metric.quoteCount, previousMetric.quoteCount)}
          />
          <SellerMetricCard
            title="Vendas Fechadas"
            value={String(metric.saleCount)}
            helper={countDelta(metric.saleCount, previousMetric.saleCount)}
          />
          <SellerMetricCard
            title="Taxa de Conversão (R$)"
            value={percent(metric.conversionValue)}
            helper={pointDelta(
              metric.conversionValue,
              previousMetric.conversionValue,
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minha Meta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold">
                  {money(metric.totalClosed)}
                </p>
                <p className="text-base font-medium text-muted-foreground">
                  {target
                    ? `${percent(progress)} de ${money(target)}`
                    : "Sem meta"}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div>
              <GoalLevel
                label="Meta Base"
                amount={metric.goalBase}
                iconSrc="/medal-bronze.svg"
                active={
                  metric.totalClosed >= metric.goalBase && !!metric.goalBase
                }
              />
              <GoalLevel
                label="Meta Média"
                amount={metric.goalMid}
                iconSrc="/medal-silver.svg"
                active={
                  metric.totalClosed >= metric.goalMid && !!metric.goalMid
                }
              />
              <GoalLevel
                label="Meta Super"
                amount={metric.goalSuper}
                iconSrc="/medal-gold.svg"
                active={
                  metric.totalClosed >= metric.goalSuper && !!metric.goalSuper
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Fechamentos dos Últimos 7 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SalesClosingBarChart data={closingChartData} />
        </CardContent>
      </Card>

      {!hasOrders ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Nenhum registro comercial no mês selecionado.
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
