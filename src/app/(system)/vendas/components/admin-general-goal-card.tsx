import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import type { SalesDashboardMetric } from "./sales-dashboard-types";

export function AdminGeneralGoalCard({
  metric,
}: {
  metric: SalesDashboardMetric;
}) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Meta Geral</CardTitle>
        <CardDescription>Todos os vendedores</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-2xl font-semibold">
              {money(metric.totalClosed)} / {money(target)}
            </p>
            <p className="text-base font-medium">{percent(progress)}</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">Meta Base</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {money(metric.goalBase)}
            </p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">Meta Média</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {money(metric.goalMid)}
            </p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">Meta Super</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {money(metric.goalSuper)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
