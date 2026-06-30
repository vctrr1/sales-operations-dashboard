import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssemblyStatus } from "@/generated/prisma/enums";
import type { SalesOperationalSummaryItem } from "./sales-dashboard-types";

const statusColors: Record<string, string> = {
  [AssemblyStatus.TO_SCHEDULE]: "bg-red-400",
  [AssemblyStatus.NO_ASSEMBLY]: "bg-amber-400",
  [AssemblyStatus.ASSEMBLED]: "bg-violet-500",
  [AssemblyStatus.FINISHED]: "bg-sky-400",
  [AssemblyStatus.DELIVERED]: "bg-emerald-500",
};

export function AdminOperationalSummary({
  items,
}: {
  items: SalesOperationalSummaryItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumo Operacional</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.key}
            className="mt-4 flex items-center justify-between border-b border-dashed pb-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-2.5 rounded-full ${statusColors[item.key] ?? "bg-muted-foreground"}`}
              />
              <p className="text-base font-medium text-muted-foreground">
                {item.label}
              </p>
            </div>
            <p className="text-2xl font-semibold">{item.count}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
