"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  AssemblyStatus,
  LogisticsType,
  Priority,
  ProductCategory,
} from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { updateAssemblyOrderStatus } from "../../actions";
import { AssemblyOrderDialog } from "./assembly-order-dialog";

const columns = [
  AssemblyStatus.TO_SCHEDULE,
  AssemblyStatus.NO_ASSEMBLY,
  AssemblyStatus.ASSEMBLED,
  AssemblyStatus.FINISHED,
  AssemblyStatus.DELIVERED,
];

const priorityStyles: Record<Priority, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  LOW: "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

const statusStyles: Record<
  AssemblyStatus,
  { column: string; dot: string; count: string; cardAccent: string }
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

export type AssemblyBoardOrder = {
  id: string;
  status: AssemblyStatus;
  priority: Priority;
  scheduledDate: Date | null;
  scheduleNotes: string | null;
  saleOrder: {
    orderNumber: number;
    customerName: string;
    sellerName: string;
    logisticsType: LogisticsType;
    productCategories: ProductCategory[];
    deliveryAddress: string | null;
    notes: string | null;
    items: { id: string; quantity: number; description: string }[];
  };
};

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getDateTone(date: Date | null) {
  if (!date) return { label: "Sem data", className: dateToneStyles.empty };

  const diffInDays =
    (startOfUtcDay(date) - startOfUtcDay(new Date())) / 86_400_000;

  if (diffInDays < 0) {
    return { label: "Atrasado", className: dateToneStyles.overdue };
  }
  if (diffInDays === 0) {
    return { label: "Hoje", className: dateToneStyles.today };
  }
  if (diffInDays <= 3) {
    return {
      label: diffInDays === 1 ? "Amanhã" : "Próximo",
      className: dateToneStyles.soon,
    };
  }

  return { label: "Programado", className: dateToneStyles.future };
}

function formatProductCategories(categories: ProductCategory[]) {
  return categories.map((category) => productCategoryLabels[category]).join(", ");
}

function AssemblyColumn({
  status,
  orders,
  pendingOrderIds,
  suppressDialogClick,
}: {
  status: AssemblyStatus;
  orders: AssemblyBoardOrder[];
  pendingOrderIds: Set<string>;
  suppressDialogClick: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const styles = statusStyles[status];

  return (
    <Card
      size="sm"
      className={cn(
        "min-h-0 border ring-0 transition-shadow",
        styles.column,
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <CardTitle className="flex items-center gap-2 text-lg!">
          <span className={cn("size-2.5 rounded-full", styles.dot)} />
          {assemblyStatusLabels[status]}
        </CardTitle>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-base font-medium",
            styles.count,
          )}
        >
          {orders.length}
        </span>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 px-2">
        <ScrollArea className="h-full pr-2">
          <div ref={setNodeRef} className="grid min-h-24 gap-3 rounded-lg">
            {orders.map((assembly) => (
              <DraggableAssemblyCard
                key={assembly.id}
                assembly={assembly}
                accentClassName={styles.cardAccent}
                isPending={pendingOrderIds.has(assembly.id)}
                suppressDialogClick={suppressDialogClick}
              />
            ))}

            {orders.length === 0 ? (
              <div
                className={cn(
                  "rounded-lg border border-dashed p-4 text-center text-base text-muted-foreground transition-colors",
                  isOver && "border-primary bg-background/60 text-foreground",
                )}
              >
                Solte uma ordem aqui
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function DraggableAssemblyCard({
  assembly,
  accentClassName,
  isPending,
  suppressDialogClick,
}: {
  assembly: AssemblyBoardOrder;
  accentClassName: string;
  isPending: boolean;
  suppressDialogClick: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: assembly.id,
    disabled: isPending,
  });
  const dateTone = getDateTone(assembly.scheduledDate);
  const dateText = displayDate(assembly.scheduledDate);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          ref={setNodeRef}
          onClickCapture={suppressDialogClick}
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab touch-none active:cursor-grabbing",
            (isDragging || isPending) && "pointer-events-none opacity-50",
          )}
        >
          <Card
            size="sm"
            className={cn(
              "border border-l-4 border-border bg-background/80 text-left shadow-sm ring-0 transition-colors hover:bg-background",
              accentClassName,
            )}
          >
            <CardHeader className="grid-cols-[1fr_auto] gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base!">
                  #{assembly.saleOrder.orderNumber} {assembly.saleOrder.customerName}
                </CardTitle>
                <CardDescription className="text-base!">
                  {assembly.saleOrder.sellerName} ·{" "}
                  {logisticsTypeLabels[assembly.saleOrder.logisticsType]}
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
                  {assembly.scheduledDate ? <CalendarDays className="size-3.5" /> : null}
                  {assembly.scheduledDate
                    ? `${dateTone.label} · ${dateText}`
                    : dateTone.label}
                </span>
              </div>
              <p className="text-base text-muted-foreground">
                {formatProductCategories(assembly.saleOrder.productCategories)}
              </p>
              <ul className="grid gap-1 text-base">
                {assembly.saleOrder.items.slice(0, 3).map((item) => (
                  <li key={item.id} className="line-clamp-1">
                    {item.quantity}x {item.description}
                  </li>
                ))}
                {assembly.saleOrder.items.length > 3 ? (
                  <li className="text-muted-foreground">
                    +{assembly.saleOrder.items.length - 3} itens
                  </li>
                ) : null}
              </ul>
              {assembly.saleOrder.notes ? (
                <Badge variant="secondary" className="max-w-full truncate text-base">
                  {assembly.saleOrder.notes}
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>

      <AssemblyOrderDialog assembly={assembly} />
    </Dialog>
  );
}

export function AssemblyBoard({ initialOrders }: { initialOrders: AssemblyBoardOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pendingOrderIds, setPendingOrderIds] = useState<Set<string>>(new Set());
  const suppressNextDialogClick = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function suppressDialogClick(event: MouseEvent<HTMLDivElement>) {
    if (!suppressNextDialogClick.current) return;

    suppressNextDialogClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function clearDialogClickSuppression() {
    window.setTimeout(() => {
      suppressNextDialogClick.current = false;
    }, 0);
  }

  async function handleDragEnd(event: DragEndEvent) {
    clearDialogClickSuppression();

    const { active, over } = event;
    if (!over) return;

    const orderId = String(active.id);
    const status = String(over.id) as AssemblyStatus;

    if (!columns.includes(status)) return;

    const previousOrder = orders.find((order) => order.id === orderId);
    if (!previousOrder || previousOrder.status === status) return;

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
    setPendingOrderIds((current) => new Set(current).add(orderId));

    const result = await updateAssemblyOrderStatus(orderId, status);

    setPendingOrderIds((current) => {
      const next = new Set(current);
      next.delete(orderId);
      return next;
    });

    if (!result.ok) {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: previousOrder.status } : order,
        ),
      );
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => {
        suppressNextDialogClick.current = true;
      }}
      onDragCancel={clearDialogClickSuppression}
      onDragEnd={handleDragEnd}
    >
      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-5">
        {columns.map((status) => (
          <AssemblyColumn
            key={status}
            status={status}
            orders={orders.filter((order) => order.status === status)}
            pendingOrderIds={pendingOrderIds}
            suppressDialogClick={suppressDialogClick}
          />
        ))}
      </section>
    </DndContext>
  );
}
