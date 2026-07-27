import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarOrderCard } from "./calendar-order-card";
import type { CalendarOrder } from "./calendar-types";

export function UnscheduledOrdersList({
  orders,
}: {
  orders: CalendarOrder[];
}) {
  return (
    <Card>
      <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
        <CardTitle className="text-lg">Sem data programada</CardTitle>
        <span className="rounded-md bg-muted px-2 py-1 text-base text-muted-foreground">
          {orders.length}
        </span>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <CalendarOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-base text-muted-foreground">
            Nenhuma ordem fechada aguardando data.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
