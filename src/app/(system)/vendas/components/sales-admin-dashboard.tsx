import { Card, CardContent } from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import { AdminCompositionDonutCard } from "./admin-composition-donut-card";
import { AdminGeneralGoalCard } from "./admin-general-goal-card";
import { AdminOperationalSummary } from "./admin-operational-summary";
import { AdminSellerPerformanceTable } from "./admin-seller-performance-table";
import type {
  SalesCompositionItem,
  SalesDashboardMetric,
  SalesOperationalSummaryItem,
} from "./sales-dashboard-types";

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-base text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function SalesAdminDashboard({
  generalMetric,
  sellerMetrics,
  categoryData,
  customerOriginData,
  logisticsData,
  operationalSummary,
}: {
  generalMetric: SalesDashboardMetric;
  sellerMetrics: SalesDashboardMetric[];
  categoryData: SalesCompositionItem[];
  customerOriginData: SalesCompositionItem[];
  logisticsData: SalesCompositionItem[];
  operationalSummary: SalesOperationalSummaryItem[];
}) {
  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Orçado"
          value={money(generalMetric.totalQuoted)}
        />
        <MetricCard
          title="Total Fechado"
          value={money(generalMetric.totalClosed)}
        />
        <MetricCard
          title="Taxa de Conversão (nº)"
          value={percent(generalMetric.conversionCount)}
        />
        <MetricCard title="Ticket Médio" value={money(generalMetric.ticket)} />
        <MetricCard
          title="Total de Vendas (nº)"
          value={String(generalMetric.saleCount)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AdminGeneralGoalCard metric={generalMetric} />
        <AdminCompositionDonutCard
          title="Categorias mais vendidas"
          data={categoryData}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AdminOperationalSummary items={operationalSummary} />
        <AdminCompositionDonutCard
          title="Logística dos pedidos"
          data={logisticsData}
          valueType="quantity"
          centerLabel="Pedidos"
          legendPosition="bottom"
        />
        <AdminCompositionDonutCard
          title="Origem do cliente"
          data={customerOriginData}
          valueType="quantity"
          centerLabel="Vendas"
          legendPosition="bottom"
        />
      </section>

      <section>
        <AdminSellerPerformanceTable metrics={sellerMetrics} />
      </section>
    </>
  );
}
