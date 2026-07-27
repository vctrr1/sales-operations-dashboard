import { MapPin } from "lucide-react";
import {
  assemblyStatusLabels,
  logisticsTypeLabels,
  priorityLabels,
} from "@/lib/domain";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalendarOrder } from "./calendar-types";

const priorityStyles = {
  HIGH: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  LOW: "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
} satisfies Record<CalendarOrder["priority"], string>;

const statusAccentStyles = {
  TO_SCHEDULE: "border-l-red-400",
  NO_ASSEMBLY: "border-l-amber-400",
  ASSEMBLED: "border-l-violet-500",
  FINISHED: "border-l-sky-400",
  DELIVERED: "border-l-emerald-500",
} satisfies Record<CalendarOrder["status"], string>;

const statusBadgeStyles = {
  TO_SCHEDULE: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  NO_ASSEMBLY:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  ASSEMBLED:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  FINISHED: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  DELIVERED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
} satisfies Record<CalendarOrder["status"], string>;

export function CalendarOrderCard({ order }: { order: CalendarOrder }) {
  return (
    <article
      className={cn(
        "relative grid gap-1 rounded-md border border-l-4 bg-background/80 p-2 text-base shadow-sm",
        statusAccentStyles[order.status],
      )}
    >
      <span
        className={cn(
          "absolute right-2 top-2 rounded-md border px-1.5 py-0.5 text-xs font-medium",
          priorityStyles[order.priority],
        )}
      >
        {priorityLabels[order.priority]}
      </span>

      <div className="min-w-0 pr-13">
        <p className="truncate font-medium">
          #{order.saleOrder.orderNumber} {order.saleOrder.customerName}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {order.saleOrder.sellerName} ·{" "}
          {logisticsTypeLabels[order.saleOrder.logisticsType]}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-xs font-medium",
            statusBadgeStyles[order.status],
          )}
        >
          {assemblyStatusLabels[order.status]}
        </span>
        <span>{money(order.saleOrder.closedAmount)}</span>
      </div>

      {order.saleOrder.deliveryAddress ? (
        <div className="flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1">
            {order.saleOrder.deliveryAddress}
          </span>
        </div>
      ) : null}

      <ul className="grid gap-0.5 text-sm">
        {order.saleOrder.items.slice(0, 2).map((item) => (
          <li key={item.id} className="truncate">
            {item.quantity}x {item.description}
          </li>
        ))}
        {order.saleOrder.items.length > 2 ? (
          <li className="text-muted-foreground">
            +{order.saleOrder.items.length - 2} itens
          </li>
        ) : null}
      </ul>
    </article>
  );
}
