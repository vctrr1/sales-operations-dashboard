import { AssemblyStatus, Priority, UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AssemblyBoard } from "./components/assembly-board";
import { ProductionNotificationWatcher } from "./components/production-notification-watcher";

const priorityWeight: Record<Priority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
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

function getInitialNotificationCursor(
  orders: { status: AssemblyStatus; requestedAt: Date }[],
) {
  const latestToSchedule = orders.reduce<Date | null>((latest, order) => {
    if (order.status !== AssemblyStatus.TO_SCHEDULE) return latest;
    if (!latest || order.requestedAt.getTime() > latest.getTime()) {
      return order.requestedAt;
    }
    return latest;
  }, null);

  return (latestToSchedule ?? new Date(0)).toISOString();
}

export default async function AssemblyPage() {
  const user = await requireRole([UserRole.OPERATION, UserRole.ADMIN]);

  const assemblyOrders = await prisma.assemblyOrder.findMany({
    where: {
      saleOrder: {
        commercialStatus: "CLOSED",
      },
    },
    select: {
      id: true,
      status: true,
      priority: true,
      scheduledDate: true,
      scheduleNotes: true,
      orderIndex: true,
      requestedAt: true,
      updatedAt: true,
      saleOrder: {
        select: {
          orderNumber: true,
          customerName: true,
          sellerName: true,
          logisticsType: true,
          productCategories: true,
          deliveryAddress: true,
          notes: true,
          items: {
            select: {
              id: true,
              quantity: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { scheduledDate: "asc" },
      { orderIndex: "asc" },
      { requestedAt: "asc" },
    ],
  });
  const initialNotificationCursor = getInitialNotificationCursor(assemblyOrders);
  const initialOrders = [...assemblyOrders].sort(compareAssemblyOrders);
  const boardKey = assemblyOrders
    .map((order) => `${order.id}:${order.updatedAt.getTime()}`)
    .join("|");

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col overflow-hidden">
      {user.role === UserRole.OPERATION ? (
        <ProductionNotificationWatcher initialCursor={initialNotificationCursor} />
      ) : null}
      <AssemblyBoard key={boardKey} initialOrders={initialOrders} />
    </div>
  );
}
