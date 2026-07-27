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

function buildCalendarDays(monthStart: Date) {
  const gridStart = addUtcDays(monthStart, -monthStart.getUTCDay());
  const todayKey = utcDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addUtcDays(gridStart, index);
    const key = utcDateKey(date);

    return {
      date,
      key,
      dayNumber: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
      isToday: key === todayKey,
    } satisfies CalendarDay;
  });
}

export function calendarGridRange(monthStart: Date) {
  const gridStart = addUtcDays(monthStart, -monthStart.getUTCDay());
  const gridEnd = addUtcDays(gridStart, 42);

  return { gridStart, gridEnd };
}

export function CalendarMonthGrid({
  monthStart,
  orders,
  events,
}: {
  monthStart: Date;
  orders: CalendarOrder[];
  events: CalendarEvent[];
}) {
  const days = buildCalendarDays(monthStart);
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
    <section className="overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-sm font-medium uppercase text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
        {days.map((day) => {
          const dateOrders = ordersByDate.get(day.key) ?? [];
          const dateEvents = eventsByDate.get(day.key) ?? [];
          const dateItemsCount = dateOrders.length + dateEvents.length;

          return (
            <div
              key={day.key}
              className={cn(
                "min-h-42 border-b p-2 md:border-r",
                !day.inCurrentMonth && "bg-muted/30 text-muted-foreground",
                day.isToday && "bg-primary/5",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-base font-medium",
                    day.isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {day.dayNumber}
                </span>
                {dateItemsCount > 0 ? (
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {dateItemsCount}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-2">
                {dateEvents.slice(0, 2).map((event) => (
                  <CalendarEventCard key={event.id} event={event} />
                ))}
                {dateOrders.slice(0, Math.max(4 - dateEvents.length, 0)).map((order) => (
                  <CalendarOrderCard key={order.id} order={order} />
                ))}
                {dateItemsCount > 4 ? (
                  <div className="rounded-md border border-dashed p-2 text-sm text-muted-foreground">
                    +{dateItemsCount - 4} itens neste dia
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
