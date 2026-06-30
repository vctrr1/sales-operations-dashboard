import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import type { SalesDashboardMetric } from "./sales-dashboard-types";

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function GoalBar({ metric }: { metric: SalesDashboardMetric }) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  return (
    <div className="grid gap-2">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span>Base {money(metric.goalBase)}</span>
        <span>Média {money(metric.goalMid)}</span>
        <span>Super {money(metric.goalSuper)}</span>
      </div>
    </div>
  );
}

export function SalesAdminDashboard({
  generalMetric,
  sellerMetrics,
}: {
  generalMetric: SalesDashboardMetric;
  sellerMetrics: SalesDashboardMetric[];
}) {
  return (
    <>
      <section className="grid gap-3 md:grid-cols-5">
        <MetricCard
          title="Total orçado"
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
        <MetricCard title="Vendas" value={String(generalMetric.saleCount)} />
        <MetricCard title="Ticket Médio" value={money(generalMetric.ticket)} />
      </section>

      <Card>
        <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Meta Geral</CardTitle>
          <CardDescription>
            Conversão valor {percent(generalMetric.conversionValue)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalBar metric={generalMetric} />
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {sellerMetrics.map((metric) => (
          <Card key={metric.sellerName}>
            <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
              <CardTitle>{metric.sellerName}</CardTitle>
              <CardDescription>
                Desconto médio {percent(metric.discountAverage)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-6">
                <MetricCard title="Orçado" value={money(metric.totalQuoted)} />
                <MetricCard title="Fechado" value={money(metric.totalClosed)} />
                <MetricCard
                  title="Conversão nº"
                  value={percent(metric.conversionCount)}
                />
                <MetricCard
                  title="Conversão R$"
                  value={percent(metric.conversionValue)}
                />
                <MetricCard title="Vendas" value={String(metric.saleCount)} />
                <MetricCard title="Ticket" value={money(metric.ticket)} />
              </div>
              <GoalBar metric={metric} />
            </CardContent>
          </Card>
        ))}
        {sellerMetrics.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Nenhum registro comercial no mês selecionado.
            </CardContent>
          </Card>
        ) : null}
      </section>
    </>
  );
}
