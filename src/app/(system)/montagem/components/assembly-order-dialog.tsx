"use client";

import {
  CalendarDays,
  MapPin,
  MessageSquareText,
  Package,
  PencilLine,
  Save,
  ListSortDescending,
} from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AssemblyStatus,
  LogisticsType,
  Priority,
  ProductCategory,
} from "@/generated/prisma/enums";
import {
  assemblyStatusLabels,
  logisticsTypeLabels,
  priorityLabels,
  productCategoryLabels,
} from "@/lib/domain";
import { dateInputValue, displayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { updateAssemblySchedule } from "../../actions";

const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const priorityStyles: Record<Priority, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  LOW: "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

const statusStyles: Record<AssemblyStatus, string> = {
  TO_SCHEDULE:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  NO_ASSEMBLY:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  ASSEMBLED:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  FINISHED:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
  DELIVERED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
};

function formatProductCategories(categories: ProductCategory[]) {
  return categories
    .map((category) => productCategoryLabels[category])
    .join(", ");
}

type AssemblyOrderDialogProps = {
  assembly: {
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
      items: {
        id: string;
        quantity: number;
        description: string;
      }[];
    };
  };
};

export function AssemblyOrderDialog({ assembly }: AssemblyOrderDialogProps) {
  const dateText = displayDate(assembly.scheduledDate);

  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] text-base! sm:max-w-2xl">
      <DialogHeader className="gap-2">
        <DialogTitle className="text-lg!">
          #{assembly.saleOrder.orderNumber} {assembly.saleOrder.customerName}
        </DialogTitle>
        <DialogDescription className="text-base!">
          {assembly.saleOrder.sellerName} ·{" "}
          {logisticsTypeLabels[assembly.saleOrder.logisticsType]}
        </DialogDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge
            variant="outline"
            className={cn("text-base", statusStyles[assembly.status])}
          >
            {assemblyStatusLabels[assembly.status]}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-base", priorityStyles[assembly.priority])}
          >
            Prioridade {priorityLabels[assembly.priority]}
          </Badge>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(100dvh-12rem)] pr-3">
        <div className="grid gap-5 pb-1">
          <section className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-base md:grid-cols-2">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Data marcada</p>
                <p className="font-medium">{dateText}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Endereço</p>
                <p className="font-medium">
                  {assembly.saleOrder.deliveryAddress ?? "Sem endereço"}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-1">
            <h3 className="flex items-center gap-2 text-base font-medium">
              <Package className="size-4 text-muted-foreground" />
              Itens do pedido
            </h3>
            <ul className="grid gap-2 rounded-lg border p-3 text-base">
              {assembly.saleOrder.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.description}
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-1">
            <h3 className="flex items-center gap-2 text-base font-medium">
              <ListSortDescending className="size-4 text-muted-foreground" />
              Categoria
            </h3>
            <p className="rounded-lg border bg-muted/30 p-3 text-base">
              {formatProductCategories(assembly.saleOrder.productCategories)}
            </p>
          </section>

          {assembly.saleOrder.notes ? (
            <section className="grid gap-1">
              <h3 className="flex items-center gap-2 text-base font-medium">
                <MessageSquareText className="size-4 text-muted-foreground" />
                Observações comerciais
              </h3>
              <p className="rounded-lg border bg-muted/30 p-3 text-base">
                {assembly.saleOrder.notes}
              </p>
            </section>
          ) : null}

          <ActionForm
            action={updateAssemblySchedule}
            className="grid gap-3 rounded-lg border p-3"
          >
            <input type="hidden" name="id" value={assembly.id} />
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-2 text-base font-medium">
                <PencilLine className="size-4 text-muted-foreground" />
                Programação
              </h3>
              <Input
                type="date"
                name="scheduledDate"
                defaultValue={dateInputValue(assembly.scheduledDate)}
                className="text-base md:text-base"
                aria-label="Data marcada"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-2 text-base font-medium">
                <MessageSquareText className="size-4 text-muted-foreground" />
                Observações de montagem
              </h3>
              <textarea
                name="scheduleNotes"
                defaultValue={assembly.scheduleNotes ?? ""}
                className={textareaClass}
                aria-label="Prazo ou observação"
                placeholder="Prazo ou observação da montagem"
              />
            </div>
            <Button
              type="submit"
              className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
              variant="outline"
            >
              <Save />
              Salvar programação
            </Button>
          </ActionForm>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
