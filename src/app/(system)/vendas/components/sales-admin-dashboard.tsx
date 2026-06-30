import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AdminCompositionDonutCard } from "./admin-composition-donut-card";
import { AdminGeneralGoalCard } from "./admin-general-goal-card";
import { AdminOperationalSummary } from "./admin-operational-summary";
import { AdminSellerPerformanceTable } from "./admin-seller-performance-table";
import { SalesClosingBarChart } from "./sales-closing-bar-chart";
import type {
  SalesClosingChartItem,
  SalesCompositionItem,
  SalesDashboardMetric,
  SalesOperationalSummaryItem,
} from "./sales-dashboard-types";

type MetricHelper = {
  value: string;
  suffix: string;
  tone: "positive" | "negative" | "neutral";
};

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: MetricHelper;
}) {
  return (
    <Card size="sm" className="border-border/70 shadow-sm">
      <CardContent>
        <div className="grid gap-2">
          <p className="text-base font-medium text-muted-foreground">
            {title}
          </p>
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
      </CardContent>
    </Card>
  );
}

export function SalesAdminDashboard({
  generalMetric,
  previousMetric,
  sellerMetrics,
  categoryData,
  customerOriginData,
  logisticsData,
  operationalSummary,
  closingChartData,
}: {
  generalMetric: SalesDashboardMetric;
  previousMetric: SalesDashboardMetric;
  sellerMetrics: SalesDashboardMetric[];
  categoryData: SalesCompositionItem[];
  customerOriginData: SalesCompositionItem[];
  logisticsData: SalesCompositionItem[];
  operationalSummary: SalesOperationalSummaryItem[];
  closingChartData: SalesClosingChartItem[];
}) {
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
    };
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
    };
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
    };
  }

  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Orçado"
          value={money(generalMetric.totalQuoted)}
          helper={percentDelta(
            generalMetric.totalQuoted,
            previousMetric.totalQuoted,
          )}
        />
        <MetricCard
          title="Total Fechado"
          value={money(generalMetric.totalClosed)}
          helper={percentDelta(
            generalMetric.totalClosed,
            previousMetric.totalClosed,
          )}
        />
        <MetricCard
          title="Taxa de Conversão (nº)"
          value={percent(generalMetric.conversionCount)}
          helper={pointDelta(
            generalMetric.conversionCount,
            previousMetric.conversionCount,
          )}
        />
        <MetricCard
          title="Ticket Médio"
          value={money(generalMetric.ticket)}
          helper={percentDelta(generalMetric.ticket, previousMetric.ticket)}
        />
        <MetricCard
          title="Total de Vendas (nº)"
          value={String(generalMetric.saleCount)}
          helper={countDelta(generalMetric.saleCount, previousMetric.saleCount)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AdminGeneralGoalCard metric={generalMetric} />
        <AdminCompositionDonutCard
          title="Categorias mais Vendidas"
          data={categoryData}
        />
      </section>

      <section>
        <AdminSellerPerformanceTable metrics={sellerMetrics} />
      </section>

      <section>
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
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AdminOperationalSummary items={operationalSummary} />
        <AdminCompositionDonutCard
          title="Logística dos Pedidos"
          data={logisticsData}
          valueType="quantity"
          centerLabel="Pedidos"
          legendPosition="bottom"
        />
        <AdminCompositionDonutCard
          title="Origem do Cliente"
          data={customerOriginData}
          valueType="quantity"
          centerLabel="Vendas"
          legendPosition="bottom"
        />
      </section>
    </>
  );
}
