import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import { SalesClosingBarChart } from "./sales-closing-bar-chart";
import type {
  SalesClosingChartItem,
  SalesDashboardMetric,
} from "./sales-dashboard-types";

function SellerMetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <Card size="sm" className="border-border/70 shadow-sm">
      <CardContent className="grid gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{helper}</p>
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
  hasOrders,
  closingChartData,
}: {
  metric: SalesDashboardMetric;
  hasOrders: boolean;
  closingChartData: SalesClosingChartItem[];
}) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SellerMetricCard
          title="Total Orçado"
          value={money(metric.totalQuoted)}
          helper={`${metric.quoteCount} orçamentos no mês`}
        />
        <SellerMetricCard
          title="Total Fechado"
          value={money(metric.totalClosed)}
          helper={`${metric.saleCount} vendas fechadas`}
        />
        <SellerMetricCard
          title="Conversão"
          value={percent(metric.conversionCount)}
          helper={`${percent(metric.conversionValue)} em valor`}
        />
        <SellerMetricCard
          title="Ticket Médio"
          value={money(metric.ticket)}
          helper="Média por venda fechada"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fechamentos do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesClosingBarChart data={closingChartData} />
          </CardContent>
        </Card>

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
