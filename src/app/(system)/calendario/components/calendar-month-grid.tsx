import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEventCard } from "./calendar-event-card";
import { CalendarOrderCard } from "./calendar-order-card";
import type { CalendarEvent, CalendarOrder } from "./calendar-types";
import { cn } from "@/lib/utils";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type CalendarDay = {
  date: Date;
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, amount: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + amount,
    ),
  );
}

function buildCalendarDays(startDate: Date, viewMode: "month" | "week") {
  const gridStart =
    viewMode === "week"
      ? startDate
      : addUtcDays(startDate, -startDate.getUTCDay());
  const todayKey = utcDateKey(new Date());

  return Array.from({ length: viewMode === "week" ? 7 : 42 }, (_, index) => {
    const date = addUtcDays(gridStart, index);
    const key = utcDateKey(date);

    return {
      date,
      key,
      dayNumber: date.getUTCDate(),
      inCurrentMonth:
        viewMode === "week" ||
        date.getUTCMonth() === startDate.getUTCMonth(),
      isToday: key === todayKey,
    } satisfies CalendarDay;
  });
}

export function calendarGridRange(
  startDate: Date,
  viewMode: "month" | "week" = "month",
) {
  const gridStart =
    viewMode === "week"
      ? startDate
      : addUtcDays(startDate, -startDate.getUTCDay());
  const gridEnd = addUtcDays(gridStart, viewMode === "week" ? 7 : 42);

  return { gridStart, gridEnd };
}

export function CalendarMonthGrid({
  startDate,
  viewMode = "month",
  orders,
  events,
}: {
  startDate: Date;
  viewMode?: "month" | "week";
  orders: CalendarOrder[];
  events: CalendarEvent[];
}) {
  const days = buildCalendarDays(startDate, viewMode);
  const ordersByDate = new Map<string, CalendarOrder[]>();
  const eventsByDate = new Map<string, CalendarEvent[]>();

  for (const order of orders) {
    if (!order.scheduledDate) continue;

    const key = utcDateKey(order.scheduledDate);
    const dateOrders = ordersByDate.get(key) ?? [];
    dateOrders.push(order);
    ordersByDate.set(key, dateOrders);
  }

  for (const event of events) {
    const key = utcDateKey(event.eventDate);
    const dateEvents = eventsByDate.get(key) ?? [];
    dateEvents.push(event);
    eventsByDate.set(key, dateEvents);
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-card text-card-foreground",
        viewMode === "week" && "flex min-h-0 flex-1 flex-col",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-7 border-b bg-muted/50",
          viewMode === "week" && "hidden",
        )}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-sm font-medium uppercase text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid min-h-0",
          viewMode === "week"
            ? "flex-1 grid-cols-7 grid-rows-1"
            : "grid-cols-1 md:grid-cols-7",
        )}
      >
        {days.map((day) => {
          const dateOrders = ordersByDate.get(day.key) ?? [];
          const dateEvents = eventsByDate.get(day.key) ?? [];
          const dateItemsCount = dateOrders.length + dateEvents.length;

          return (
            <div
              key={day.key}
              className={cn(
                "flex min-w-0 flex-col border-b p-2 md:border-r",
                viewMode === "week"
                  ? "h-full min-h-0"
                  : "min-h-42 md:h-60",
                !day.inCurrentMonth && "bg-muted/60 text-muted-foreground",
                day.isToday && "bg-primary/10",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full text-base font-medium",
                    viewMode === "week"
                      ? "h-auto w-auto gap-2 px-2 py-1"
                      : "size-7",
                    day.isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {viewMode === "week" ? (
                    <span>
                      {weekDays[day.date.getUTCDay()]}
                    </span>
                  ) : null}
                  {day.dayNumber}
                </span>
                {dateItemsCount > 0 ? (
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {dateItemsCount}
                  </span>
                ) : null}
              </div>

              <ScrollArea className="-mr-1 min-h-0 flex-1">
                <div className="grid gap-2 pr-2">
                  {dateEvents.map((event) => (
                    <CalendarEventCard key={event.id} event={event} />
                  ))}
                  {dateOrders.map((order) => (
                    <CalendarOrderCard key={order.id} order={order} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </section>
  );
}
