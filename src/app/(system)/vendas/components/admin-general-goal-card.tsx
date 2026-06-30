import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import type { SalesDashboardMetric } from "./sales-dashboard-types";

function GoalLevelSummary({
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
    <div className="rounded-md border border-dashed p-3 flex justify-between">
      <div className="flex flex-col">
        <p className="text-base font-medium">{label}</p>
        <p className="mt-2 text-base text-muted-foreground">{money(amount)}</p>
      </div>
      <Image
        src={iconSrc}
        alt=""
        width={40}
        height={40}
        className={active ? "opacity-100" : "opacity-30"}
      />
    </div>
  );
}

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
          <GoalLevelSummary
            label="Meta Base"
            amount={metric.goalBase}
            iconSrc="/medal-bronze.svg"
            active={metric.totalClosed >= metric.goalBase && !!metric.goalBase}
          />
          <GoalLevelSummary
            label="Meta Média"
            amount={metric.goalMid}
            iconSrc="/medal-silver.svg"
            active={metric.totalClosed >= metric.goalMid && !!metric.goalMid}
          />
          <GoalLevelSummary
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
  );
}
