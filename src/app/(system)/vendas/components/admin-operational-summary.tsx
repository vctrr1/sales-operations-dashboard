import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesOperationalSummaryItem } from "./sales-dashboard-types";

export function AdminOperationalSummary({
  items,
}: {
  items: SalesOperationalSummaryItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumo operacional</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className="rounded-md border p-4">
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{item.count}</p>
            <p className="text-sm text-muted-foreground">Pedidos</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
