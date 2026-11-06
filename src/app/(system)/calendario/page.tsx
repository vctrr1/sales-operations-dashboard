import Link from "next/link";
import { ChevronLeft, ChevronRight, Funnel } from "lucide-react";
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

type SearchParams = Promise<{ month?: string; view?: string; week?: string }>;

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

function parseWeekDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${localDateInputValue()}T00:00:00.000Z`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return new Date(`${localDateInputValue()}T00:00:00.000Z`);
  }
  return date;
}

function startOfWeek(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - date.getUTCDay(),
    ),
  );
}

function shiftWeek(date: Date, amount: number) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + amount * 7);
  return shifted.toISOString().slice(0, 10);
}

function weekTitle(start: Date) {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
  const yearFormatter = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(start)} a ${formatter.format(end)} de ${yearFormatter.format(end)}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole([UserRole.SALES, UserRole.OPERATION, UserRole.ADMIN]);

  const params = await searchParams;
  const viewMode = params.view === "week" ? "week" : "month";
  const selectedWeekDate = parseWeekDate(params.week);
  const month = parseMonth(
    viewMode === "week"
      ? selectedWeekDate.toISOString().slice(0, 7)
      : params.month,
  );
  const gridStartDate =
    viewMode === "week" ? startOfWeek(selectedWeekDate) : month.start;
  const { gridStart, gridEnd } = calendarGridRange(gridStartDate, viewMode);

  const [scheduledOrders, unscheduledOrders, calendarEvents] =
    await Promise.all([
      prisma.assemblyOrder.findMany({
        where: {
          scheduledDate: {
            gte: gridStart,
            lt: gridEnd,
          },
          saleOrder: {
            commercialStatus: "CLOSED",
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
      viewMode === "month"
        ? prisma.assemblyOrder.findMany({
            where: {
              scheduledDate: null,
              saleOrder: {
                commercialStatus: "CLOSED",
              },
            },
            include: {
              saleOrder: {
                include: { items: true },
              },
            },
            orderBy: [{ priority: "asc" }, { requestedAt: "asc" }],
          })
        : Promise.resolve([]),
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
    <div
      className={
        viewMode === "week"
          ? "mx-auto grid h-[calc(100dvh-7rem)] min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden px-3"
          : "mx-auto grid w-full gap-4 px-3"
      }
    >
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl">Calendário</h1>
          <p className="text-base text-muted-foreground">
            Ordens por data programada de montagem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              asChild
              className="text-base"
              variant={viewMode === "month" ? "default" : "outline"}
            >
              <Link href={`/calendario?month=${month.key}`}>Mês</Link>
            </Button>
            <Button
              asChild
              className="text-base"
              variant={viewMode === "week" ? "default" : "outline"}
            >
              <Link
                href={`/calendario?view=week&week=${localDateInputValue()}`}
              >
                Semana
              </Link>
            </Button>
          </div>
          {viewMode === "week" ? (
            <>
              <Button asChild variant="outline" className="text-base">
                <Link
                  href={`/calendario?view=week&week=${shiftWeek(
                    gridStartDate,
                    -1,
                  )}`}
                >
                  <ChevronLeft />
                  Anterior
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-base">
                <Link
                  href={`/calendario?view=week&week=${localDateInputValue()}`}
                >
                  Hoje
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-base">
                <Link
                  href={`/calendario?view=week&week=${shiftWeek(
                    gridStartDate,
                    1,
                  )}`}
                >
                  Próxima
                  <ChevronRight />
                </Link>
              </Button>
              <form className="flex items-center gap-2">
                <Input
                  type="date"
                  name="week"
                  defaultValue={localDateInputValue(selectedWeekDate)}
                  className="text-base md:text-base"
                />
                <input type="hidden" name="view" value="week" />
                <Button
                  type="submit"
                  className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
                >
                  <Funnel />
                  Filtrar
                </Button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
          <AddItemCalendarDialog />
        </div>
      </section>

      <section
        className={
          viewMode === "week"
            ? "grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2"
            : "grid gap-2"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">
            {viewMode === "week"
              ? weekTitle(gridStartDate)
              : monthTitle(month.key)}
          </h2>
          <p className="text-base text-muted-foreground">
            {scheduledOrders.length} ordens e {calendarEvents.length} eventos no
            período visível
          </p>
        </div>
        <CalendarMonthGrid
          startDate={gridStartDate}
          viewMode={viewMode}
          orders={scheduledOrders}
          events={calendarEvents}
        />
      </section>

      {viewMode === "month" ? (
        <UnscheduledOrdersList orders={unscheduledOrders} />
      ) : null}
    </div>
  );
}
