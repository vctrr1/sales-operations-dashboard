import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money, percent } from "@/lib/format";
import type { SalesDashboardMetric } from "./sales-dashboard-types";

function CompactGoalBar({ metric }: { metric: SalesDashboardMetric }) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs text-muted-foreground">
        {percent(progress)}
      </span>
    </div>
  );
}

export function AdminSellerPerformanceTable({
  metrics,
}: {
  metrics: SalesDashboardMetric[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Desempenho por vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Total Orçado</TableHead>
                <TableHead>Total Fechado</TableHead>
                <TableHead>Conversão</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Ticket Médio</TableHead>
                <TableHead>Desc. Médio</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Atingimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.sellerName}>
                  <TableCell className="font-medium">
                    {metric.sellerName}
                  </TableCell>
                  <TableCell>{money(metric.totalQuoted)}</TableCell>
                  <TableCell>{money(metric.totalClosed)}</TableCell>
                  <TableCell>{percent(metric.conversionCount)}</TableCell>
                  <TableCell>{metric.saleCount}</TableCell>
                  <TableCell>{money(metric.ticket)}</TableCell>
                  <TableCell>{percent(metric.discountAverage)}</TableCell>
                  <TableCell>
                    {money(metric.goalSuper || metric.goalMid || metric.goalBase)}
                  </TableCell>
                  <TableCell>
                    <CompactGoalBar metric={metric} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum registro comercial no mês selecionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
