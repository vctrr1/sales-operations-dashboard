import { CalendarDays, MapPin } from "lucide-react";
import { AssemblyStatus, Priority, UserRole } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  assemblyStatusLabels,
  logisticsTypeLabels,
  priorityLabels,
  productCategoryLabels,
} from "@/lib/domain";
import { displayDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AssemblyOrderDialog } from "./components/assembly-order-dialog";

const columns = [
  AssemblyStatus.TO_SCHEDULE,
  AssemblyStatus.NO_ASSEMBLY,
  AssemblyStatus.ASSEMBLED,
  AssemblyStatus.FINISHED,
  AssemblyStatus.DELIVERED,
];

const priorityWeight: Record<Priority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const priorityStyles: Record<Priority, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  LOW: "border-slate-600 bg-slate-200 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

const statusStyles: Record<
  AssemblyStatus,
  {
    column: string;
    dot: string;
    count: string;
    cardAccent: string;
  }
> = {
  TO_SCHEDULE: {
    column:
      "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
    dot: "bg-red-400",
    count: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    cardAccent: "border-l-red-400",
  },
  NO_ASSEMBLY: {
    column:
      "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20",
    dot: "bg-amber-400",
    count:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    cardAccent: "border-l-amber-400",
  },
  ASSEMBLED: {
    column:
      "border-violet-200 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/20",
    dot: "bg-violet-500",
    count:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    cardAccent: "border-l-violet-500",
  },
  FINISHED: {
    column:
      "border-sky-200 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20",
    dot: "bg-sky-400",
    count: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    cardAccent: "border-l-sky-400",
  },
  DELIVERED: {
    column:
      "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    dot: "bg-emerald-500",
    count:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    cardAccent: "border-l-emerald-500",
  },
};

const dateToneStyles = {
  overdue:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  today:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
  soon: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  future:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  empty:
    "border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground",
};

type SortableAssemblyOrder = {
  priority: Priority;
  scheduledDate: Date | null;
  orderIndex: number;
  requestedAt: Date;
};

function dateTime(date: Date | null) {
  return date?.getTime() ?? Number.POSITIVE_INFINITY;
}

function compareAssemblyOrders(
  first: SortableAssemblyOrder,
  second: SortableAssemblyOrder,
) {
  return (
    priorityWeight[first.priority] - priorityWeight[second.priority] ||
    dateTime(first.scheduledDate) - dateTime(second.scheduledDate) ||
    first.orderIndex - second.orderIndex ||
    first.requestedAt.getTime() - second.requestedAt.getTime()
  );
}

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getDateTone(date: Date | null) {
  if (!date) {
    return {
      label: "Sem data",
      className: dateToneStyles.empty,
    };
  }

  const diffInDays =
    (startOfUtcDay(date) - startOfUtcDay(new Date())) / 86_400_000;

  if (diffInDays < 0) {
    return {
      label: "Atrasado",
      className: dateToneStyles.overdue,
    };
  }

  if (diffInDays === 0) {
    return {
      label: "Hoje",
      className: dateToneStyles.today,
    };
  }

  if (diffInDays <= 3) {
    return {
      label: diffInDays === 1 ? "Amanhã" : "Próximo",
      className: dateToneStyles.soon,
    };
  }

  return {
    label: "Programado",
    className: dateToneStyles.future,
  };
}

export default async function AssemblyPage() {
  await requireRole([UserRole.OPERATION, UserRole.ADMIN]);

  const assemblyOrders = await prisma.assemblyOrder.findMany({
    include: {
      saleOrder: {
        include: { items: true },
      },
    },
    orderBy: [
      { status: "asc" },
      { scheduledDate: "asc" },
      { orderIndex: "asc" },
      { requestedAt: "asc" },
    ],
  });

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col overflow-hidden">
      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-5">
        {columns.map((status) => {
          const cards = assemblyOrders
            .filter((order) => order.status === status)
            .sort(compareAssemblyOrders);
          const styles = statusStyles[status];

          return (
            <Card
              key={status}
              size="sm"
              className={cn("min-h-0 border ring-0", styles.column)}
            >
              <CardHeader className="grid-cols-[1fr_auto] items-center">
                <CardTitle className="flex items-center gap-2 !text-lg">
                  <span className={cn("size-2.5 rounded-full", styles.dot)} />
                  {assemblyStatusLabels[status]}
                </CardTitle>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-base font-medium",
                    styles.count,
                  )}
                >
                  {cards.length}
                </span>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 px-2">
                <ScrollArea className="h-full pr-2">
                  <div className="grid gap-3">
                    {cards.map((assembly) => {
                      const dateTone = getDateTone(assembly.scheduledDate);
                      const dateText = displayDate(assembly.scheduledDate);

                      return (
                        <Dialog key={assembly.id}>
                          <DialogTrigger asChild>
                            <Card
                              size="sm"
                              className={cn(
                                "cursor-pointer border border-l-4 border-border bg-background/80 text-left shadow-sm ring-0 transition-colors hover:bg-background",
                                styles.cardAccent,
                              )}
                            >
                              <CardHeader className="grid-cols-[1fr_auto] gap-2">
                                <div className="min-w-0">
                                  <CardTitle className="!text-base">
                                    #{assembly.saleOrder.orderNumber}{" "}
                                    {assembly.saleOrder.customerName}
                                  </CardTitle>
                                  <CardDescription className="!text-base">
                                    {assembly.saleOrder.sellerName} ·{" "}
                                    {
                                      logisticsTypeLabels[
                                        assembly.saleOrder.logisticsType
                                      ]
                                    }
                                  </CardDescription>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-md border px-2 py-1 text-base font-medium",
                                    priorityStyles[assembly.priority],
                                  )}
                                >
                                  {priorityLabels[assembly.priority]}
                                </span>
                              </CardHeader>

                              <CardContent className="grid gap-3">
                                <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium",
                                      dateTone.className,
                                    )}
                                  >
                                    {assembly.scheduledDate ? (
                                      <CalendarDays className="size-3.5" />
                                    ) : null}
                                    {assembly.scheduledDate
                                      ? `${dateTone.label} · ${dateText}`
                                      : dateTone.label}
                                  </span>
                                </div>
                                {assembly.saleOrder.deliveryAddress ? (
                                  <div className="flex items-start gap-1 text-base text-muted-foreground">
                                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                                    <span className="line-clamp-2">
                                      {assembly.saleOrder.deliveryAddress}
                                    </span>
                                  </div>
                                ) : null}
                                <p className="text-base text-muted-foreground">
                                  {
                                    productCategoryLabels[
                                      assembly.saleOrder.productCategory
                                    ]
                                  }
                                </p>
                                <ul className="grid gap-1 text-base">
                                  {assembly.saleOrder.items
                                    .slice(0, 3)
                                    .map((item) => (
                                      <li
                                        key={item.id}
                                        className="line-clamp-1"
                                      >
                                        {item.quantity}x {item.description}
                                      </li>
                                    ))}
                                  {assembly.saleOrder.items.length > 3 ? (
                                    <li className="text-muted-foreground">
                                      +{assembly.saleOrder.items.length - 3}{" "}
                                      itens
                                    </li>
                                  ) : null}
                                </ul>
                                {assembly.saleOrder.notes ? (
                                  <Badge
                                    variant="secondary"
                                    className="max-w-full truncate text-base"
                                  >
                                    {assembly.saleOrder.notes}
                                  </Badge>
                                ) : null}
                              </CardContent>
                            </Card>
                          </DialogTrigger>

                          <AssemblyOrderDialog assembly={assembly} />
                        </Dialog>
                      );
                    })}

                    {cards.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center text-base text-muted-foreground">
                        Sem ordens
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
