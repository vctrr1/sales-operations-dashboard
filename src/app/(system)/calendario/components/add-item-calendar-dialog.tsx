import { Button } from "@/components/ui/button";
import {
  ActionFieldError,
  ActionForm,
  ActionFormError,
} from "@/components/action-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calendarEventTypeLabels,
  calendarEventTypeOptions,
} from "@/lib/domain";
import { dateInputValue } from "@/lib/format";
import { PlusIcon, Save } from "lucide-react";
import { saveCalendarEvent } from "../../actions";
import type { CalendarEvent } from "./calendar-types";

function AddItemCalendarDialog({
  event,
  trigger,
}: {
  event?: CalendarEvent;
  trigger?: React.ReactNode;
}) {
  const isEditing = !!event;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50">
            <PlusIcon />
            Adicionar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {isEditing ? "Editar programação" : "Adicionar programação"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Adicione agendamentos, retiradas, visitas técnicas ou outras
            observações do calendário.
          </DialogDescription>
        </DialogHeader>

        <ActionForm action={saveCalendarEvent} className="grid gap-4">
          <ActionFormError />
          <input type="hidden" name="id" value={event?.id ?? ""} />
          <div className="grid gap-2">
            <label className="text-base text-muted-foreground" htmlFor="title">
              Título:
            </label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={event?.title ?? ""}
              className="text-base md:text-base"
            />
            <ActionFieldError name="title" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label
                className="text-base text-muted-foreground"
                htmlFor="eventDate"
              >
                Data:
              </label>
              <Input
                id="eventDate"
                type="date"
                name="eventDate"
                required
                defaultValue={dateInputValue(event?.eventDate)}
                className="text-base md:text-base"
              />
              <ActionFieldError name="eventDate" />
            </div>
            <div className="grid gap-2">
              <label className="text-base text-muted-foreground">
                Categoria:
              </label>
              <Select
                name="type"
                required
                defaultValue={event?.type ?? "SCHEDULE"}
              >
                <SelectTrigger className="w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendarEventTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {calendarEventTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-base text-muted-foreground" htmlFor="notes">
              Observações:
            </label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={event?.notes ?? ""}
              className="min-h-28 text-base md:text-base"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="text-base" variant="destructive">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50 text-base"
            >
              <Save />
              {isEditing ? "Salvar alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

export default AddItemCalendarDialog;
