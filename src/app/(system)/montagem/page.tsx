import { CalendarDays, MapPin, Save } from "lucide-react";
import { AssemblyStatus, UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  assemblyStatusLabels,
  assemblyStatusOptions,
  logisticsTypeLabels,
  priorityLabels,
  priorityOptions,
  productCategoryLabels,
} from "@/lib/domain";
import { dateInputValue, displayDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { updateAssemblyOrder } from "../actions";

const inputClass =
  "h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const textareaClass =
  "min-h-16 w-full rounded-md border border-input bg-background px-2 py-2 text-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

const columns = [
  AssemblyStatus.TO_SCHEDULE,
  AssemblyStatus.NO_ASSEMBLY,
  AssemblyStatus.ASSEMBLED,
  AssemblyStatus.FINISHED,
  AssemblyStatus.DELIVERED,
];

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
    <div className="grid gap-5">
      <section>
        <h1 className="text-xl font-semibold">Programação de montagem</h1>
        <p className="text-sm text-muted-foreground">Ordens fechadas pelo comercial</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {columns.map((status) => {
          const cards = assemblyOrders.filter((order) => order.status === status);
          return (
            <div key={status} className="rounded-lg border bg-background p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{assemblyStatusLabels[status]}</h2>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {cards.length}
                </span>
              </div>

              <div className="grid gap-3">
                {cards.map((assembly) => (
                  <article key={assembly.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          #{assembly.saleOrder.orderNumber} {assembly.saleOrder.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assembly.saleOrder.sellerName} ·{" "}
                          {logisticsTypeLabels[assembly.saleOrder.logisticsType]}
                        </p>
                      </div>
                      <span className="rounded-md border bg-background px-2 py-1 text-xs">
                        {priorityLabels[assembly.priority]}
                      </span>
                    </div>

                    <div className="mb-3 grid gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {displayDate(assembly.scheduledDate)}
                      </div>
                      {assembly.saleOrder.deliveryAddress ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                          <span>{assembly.saleOrder.deliveryAddress}</span>
                        </div>
                      ) : null}
                      <p>{productCategoryLabels[assembly.saleOrder.productCategory]}</p>
                    </div>

                    <ul className="mb-3 grid gap-1 text-xs">
                      {assembly.saleOrder.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.description}
                        </li>
                      ))}
                    </ul>

                    {assembly.saleOrder.notes ? (
                      <p className="mb-3 rounded-md bg-background p-2 text-xs text-muted-foreground">
                        {assembly.saleOrder.notes}
                      </p>
                    ) : null}

                    <form action={updateAssemblyOrder} className="grid gap-2">
                      <input type="hidden" name="id" value={assembly.id} />
                      <select name="status" defaultValue={assembly.status} className={inputClass}>
                        {assemblyStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {assemblyStatusLabels[option]}
                          </option>
                        ))}
                      </select>
                      <select name="priority" defaultValue={assembly.priority} className={inputClass}>
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {priorityLabels[option]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        name="scheduledDate"
                        defaultValue={dateInputValue(assembly.scheduledDate)}
                        className={inputClass}
                      />
                      <textarea
                        name="scheduleNotes"
                        defaultValue={assembly.scheduleNotes ?? ""}
                        className={textareaClass}
                        aria-label="Prazo ou observação"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        <Save />
                        Salvar
                      </Button>
                    </form>
                  </article>
                ))}

                {cards.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Sem ordens
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
