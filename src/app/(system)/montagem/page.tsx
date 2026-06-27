import { CalendarDays, MapPin, Save } from "lucide-react";
import { AssemblyStatus, UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";

const textareaClass =
  "min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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
        <h1 className="text-2xl">Programação de Montagem</h1>
        <p className="text-base text-muted-foreground">
          Ordens fechadas pelo comercial
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {columns.map((status) => {
          const cards = assemblyOrders.filter(
            (order) => order.status === status,
          );
          return (
            <Card key={status} size="sm">
              <CardHeader className="grid-cols-[1fr_auto] items-center">
                <CardTitle>{assemblyStatusLabels[status]}</CardTitle>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {cards.length}
                </span>
              </CardHeader>

              <CardContent className="grid gap-3">
                {cards.map((assembly) => (
                  <Card key={assembly.id} size="sm" className="bg-muted/30">
                    <CardHeader className="grid-cols-[1fr_auto] gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-sm">
                          #{assembly.saleOrder.orderNumber}{" "}
                          {assembly.saleOrder.customerName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {assembly.saleOrder.sellerName} ·{" "}
                          {
                            logisticsTypeLabels[
                              assembly.saleOrder.logisticsType
                            ]
                          }
                        </CardDescription>
                      </div>
                      <span className="rounded-md border bg-background px-2 py-1 text-xs">
                        {priorityLabels[assembly.priority]}
                      </span>
                    </CardHeader>

                    <CardContent className="grid gap-3">
                      <div className="grid gap-2 text-xs text-muted-foreground">
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
                        <p>
                          {
                            productCategoryLabels[
                              assembly.saleOrder.productCategory
                            ]
                          }
                        </p>
                      </div>

                      <ul className="grid gap-1 text-xs">
                        {assembly.saleOrder.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity}x {item.description}
                          </li>
                        ))}
                      </ul>

                      {assembly.saleOrder.notes ? (
                        <Badge variant="secondary">
                          {assembly.saleOrder.notes}
                        </Badge>
                      ) : null}

                      <form action={updateAssemblyOrder} className="grid gap-2">
                        <input type="hidden" name="id" value={assembly.id} />
                        <Select name="status" defaultValue={assembly.status}>
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assemblyStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {assemblyStatusLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          name="priority"
                          defaultValue={assembly.priority}
                        >
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {priorityLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          name="scheduledDate"
                          defaultValue={dateInputValue(assembly.scheduledDate)}
                          className="text-xs"
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
                    </CardContent>
                  </Card>
                ))}

                {cards.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Sem ordens
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
