import { CalendarClock, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { calendarEventTypeLabels } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { deleteCalendarEvent } from "../../actions";
import AddItemCalendarDialog from "./add-item-calendar-dialog";
import type { CalendarEvent } from "./calendar-types";

const eventTypeStyles = {
  SCHEDULE: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  OTHER: "bg-slate-100 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300",
} satisfies Record<CalendarEvent["type"], string>;

const eventAccentStyles = {
  SCHEDULE: "border-l-sky-400",
  OTHER: "border-l-slate-400",
} satisfies Record<CalendarEvent["type"], string>;

export function CalendarEventCard({ event }: { event: CalendarEvent }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative grid w-full gap-1 rounded-md border border-l-4 bg-background/80 p-2 text-left text-base shadow-sm transition-colors hover:bg-background",
            eventAccentStyles[event.type],
          )}
        >
          <span
            className={cn(
              "absolute right-2 top-2 rounded-md px-1.5 py-0.5 text-xs font-medium",
              eventTypeStyles[event.type],
            )}
          >
            {calendarEventTypeLabels[event.type]}
          </span>
          <div className="min-w-0 pr-13">
            <p className="truncate font-medium">{event.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {event.createdBy?.name ?? "Sem responsável"}
            </p>
          </div>
          {event.notes ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.notes}
            </p>
          ) : null}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarClock className="size-5" />
            {event.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {calendarEventTypeLabels[event.type]} ·{" "}
            {event.createdBy?.name ?? "Sem responsável"}
          </DialogDescription>
        </DialogHeader>

        {event.notes ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-base">
            {event.notes}
          </div>
        ) : null}

        <DialogFooter>
          <form action={deleteCalendarEvent}>
            <input type="hidden" name="id" value={event.id} />
            <Button type="submit" variant="destructive" className="text-base">
              <Trash2 />
              Apagar
            </Button>
          </form>
          <AddItemCalendarDialog
            event={event}
            trigger={
              <Button className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50 text-base">
                <SquarePen />
                Editar
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
