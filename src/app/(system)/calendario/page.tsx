import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Funnel,
} from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displayMonth, localDateInputValue, parseMonth } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import {
  CalendarMonthGrid,
  calendarGridRange,
} from "./components/calendar-month-grid";
import { UnscheduledOrdersList } from "./components/unscheduled-orders-list";
import AddItemCalendarDialog from "./components/add-item-calendar-dialog";

type SearchParams = Promise<{ month?: string }>;

function monthTitle(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shiftMonth(monthKey: string, amount: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + amount, 1))
    .toISOString()
    .slice(0, 7);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole([UserRole.SALES, UserRole.OPERATION, UserRole.ADMIN]);

  const params = await searchParams;
  const month = parseMonth(params.month);
  const { gridStart, gridEnd } = calendarGridRange(month.start);

  const [scheduledOrders, unscheduledOrders, calendarEvents] = await Promise.all([
    prisma.assemblyOrder.findMany({
      where: {
        scheduledDate: {
          gte: gridStart,
          lt: gridEnd,
        },
      },
      include: {
        saleOrder: {
          include: { items: true },
        },
      },
      orderBy: [
        { scheduledDate: "asc" },
        { priority: "asc" },
        { requestedAt: "asc" },
      ],
    }),
    prisma.assemblyOrder.findMany({
      where: { scheduledDate: null },
      include: {
        saleOrder: {
          include: { items: true },
        },
      },
      orderBy: [{ priority: "asc" }, { requestedAt: "asc" }],
    }),
    prisma.calendarEvent.findMany({
      where: {
        eventDate: {
          gte: gridStart,
          lt: gridEnd,
        },
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className="mx-auto grid w-full gap-6 px-3">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl">
            <CalendarDays className="size-6" />
            Calendário
          </h1>
          <p className="text-base text-muted-foreground">
            Ordens por data programada de montagem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="text-base">
            <Link href={`/calendario?month=${shiftMonth(month.key, -1)}`}>
              <ChevronLeft />
              Anterior
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-base">
            <Link
              href={`/calendario?month=${localDateInputValue().slice(0, 7)}`}
            >
              Hoje
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-base">
            <Link href={`/calendario?month=${shiftMonth(month.key, 1)}`}>
              Próximo
              <ChevronRight />
            </Link>
          </Button>
          <form className="flex items-center gap-2">
            <Input
              type="text"
              name="month"
              pattern="\d{2}-\d{4}"
              placeholder="mm-aaaa"
              defaultValue={displayMonth(month.key)}
              className="w-37.5 text-base md:text-base"
            />
            <Button
              type="submit"
              className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
            >
              <Funnel />
              Filtrar
            </Button>
          </form>
          <AddItemCalendarDialog />
        </div>
      </section>

      <section className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-medium">{monthTitle(month.key)}</h2>
          <p className="text-base text-muted-foreground">
            {scheduledOrders.length} ordens e {calendarEvents.length} eventos
            no período visível
          </p>
        </div>
        <CalendarMonthGrid
          monthStart={month.start}
          orders={scheduledOrders}
          events={calendarEvents}
        />
      </section>

      <UnscheduledOrdersList orders={unscheduledOrders} />
    </div>
  );
}
