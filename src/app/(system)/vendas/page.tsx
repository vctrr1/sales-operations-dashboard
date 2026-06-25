import Link from "next/link";
import { Ban, Edit, Plus } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  budgetOriginLabels,
  budgetOriginOptions,
  commercialStatusLabels,
  commercialStatusOptions,
  customerOriginLabels,
  customerOriginOptions,
  logisticsTypeLabels,
  logisticsTypeOptions,
  paymentMethodLabels,
  paymentMethodOptions,
  priorityLabels,
  priorityOptions,
  productCategoryLabels,
  productCategoryOptions,
} from "@/lib/domain";
import { dateInputValue, displayDate, money, parseMonth } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { saveSaleOrder } from "../actions";
import FormField from "./components/form-field";
import SelectField from "./components/select-field";

const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const sectionCardClass = "rounded-lg";

function RadioGroup<T extends string>({
  name,
  label,
  options,
  labels,
  defaultValue,
  columns = "sm:grid-cols-2",
}: {
  name: string;
  label: string;
  options: T[];
  labels: Record<T, string>;
  defaultValue?: T;
  columns?: string;
}) {
  const checkedValue = defaultValue ?? options[0];

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium leading-snug">{label}</legend>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 py-1.5 text-sm transition-colors has-checked:border-primary/50 has-checked:bg-primary/5 hover:bg-muted/50 dark:has-checked:bg-primary/10"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={option === checkedValue}
              className="size-4 accent-primary"
            />
            <span className="leading-snug">{labels[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SearchParams = Promise<{ month?: string; edit?: string }>;

export default async function SalesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole([UserRole.SALES, UserRole.ADMIN]);
  const params = await searchParams;
  const month = parseMonth(params.month);

  const [orders, editingOrder, sellers] = await Promise.all([
    prisma.saleOrder.findMany({
      where: {
        quoteDate: {
          gte: month.start,
          lt: month.end,
        },
      },
      include: { items: true, assemblyOrder: true },
      orderBy: [{ quoteDate: "desc" }, { orderNumber: "desc" }],
    }),
    params.edit
      ? prisma.saleOrder.findUnique({
          where: { id: params.edit },
          include: { items: true, assemblyOrder: true },
        })
      : null,
    prisma.user.findMany({
      where: { role: UserRole.SALES },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const hasEditingSeller =
    !!editingOrder?.sellerName &&
    sellers.some((seller) => seller.name === editingOrder.sellerName);

  const itemRows = Array.from({
    length: Math.max(5, editingOrder?.items.length ?? 0),
  });

  const formKey = editingOrder?.id ?? "new-order";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Vendas</h1>
            <p className="text-sm text-muted-foreground">
              {editingOrder
                ? `Editando ordem ${editingOrder.orderNumber}`
                : "Novo orçamento"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editingOrder ? (
              <Button asChild variant="destructive">
                <Link href={`/vendas?month=${month.key}`}>
                  <Ban />
                  Cancelar
                </Link>
              </Button>
            ) : null}
            <Button type="submit" form="sale-order-form">
              <Plus />
              {editingOrder ? "Salvar Alterações" : "Criar Ordem"}
            </Button>
          </div>
        </div>

        <form
          id="sale-order-form"
          key={formKey}
          action={saveSaleOrder}
          className="grid gap-4 lg:grid-cols-12"
        >
          <input type="hidden" name="id" value={editingOrder?.id ?? ""} />

          <Card className={`${sectionCardClass} lg:col-span-3`}>
            <CardHeader>
              <CardTitle>Informações gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField label="Vendedor">
                <Select
                  name="sellerName"
                  required
                  defaultValue={editingOrder?.sellerName}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingOrder?.sellerName && !hasEditingSeller ? (
                      <SelectItem value={editingOrder.sellerName}>
                        {editingOrder.sellerName} (atual)
                      </SelectItem>
                    ) : null}
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.name}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Data do orçamento">
                <Input
                  type="date"
                  name="quoteDate"
                  required
                  defaultValue={dateInputValue(editingOrder?.quoteDate)}
                />
              </FormField>
              <RadioGroup
                name="commercialStatus"
                label="Status"
                options={commercialStatusOptions}
                labels={commercialStatusLabels}
                defaultValue={editingOrder?.commercialStatus}
                columns="grid-cols-2"
              />
              <FormField label="Data do fechamento">
                <Input
                  type="date"
                  name="closedAt"
                  defaultValue={dateInputValue(editingOrder?.closedAt)}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-3`}>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField label="Valor orçado">
                <Input
                  name="quotedAmount"
                  inputMode="decimal"
                  required
                  defaultValue={editingOrder?.quotedAmount?.toString() ?? ""}
                />
              </FormField>
              <FormField label="Valor fechado">
                <Input
                  name="closedAmount"
                  inputMode="decimal"
                  defaultValue={editingOrder?.closedAmount?.toString() ?? ""}
                />
              </FormField>
              <FormField label="Desconto (%)">
                <Input
                  name="discountPercent"
                  inputMode="decimal"
                  defaultValue={editingOrder?.discountPercent?.toString() ?? ""}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-3`}>
            <CardHeader>
              <CardTitle>Forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="paymentMethod"
                label="Forma de pagamento"
                options={paymentMethodOptions}
                labels={paymentMethodLabels}
                defaultValue={editingOrder?.paymentMethod ?? undefined}
              />
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-3`}>
            <CardHeader>
              <CardTitle>Produto e logística</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SelectField
                name="productCategory"
                label="Categoria do produto"
                options={productCategoryOptions}
                labels={productCategoryLabels}
                defaultValue={editingOrder?.productCategory}
              />
              <RadioGroup
                name="logisticsType"
                label="Logística"
                options={logisticsTypeOptions}
                labels={logisticsTypeLabels}
                defaultValue={editingOrder?.logisticsType}
                columns="grid-cols-1"
              />
              <FormField label="Endereço de entrega">
                <textarea
                  name="deliveryAddress"
                  defaultValue={editingOrder?.deliveryAddress ?? ""}
                  className={textareaClass}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-8`}>
            <CardHeader>
              <CardTitle>Itens do pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FieldGroup className="grid gap-3 md:grid-cols-3">
                <FormField label="Cliente">
                  <Input
                    name="customerName"
                    required
                    defaultValue={editingOrder?.customerName ?? ""}
                  />
                </FormField>
                <FormField label="Nome da nota" className="md:col-span-2">
                  <Input
                    name="invoiceName"
                    defaultValue={editingOrder?.invoiceName ?? ""}
                  />
                </FormField>
                <FormField label="Contato responsável">
                  <Input
                    name="responsibleContact"
                    defaultValue={editingOrder?.responsibleContact ?? ""}
                  />
                </FormField>
              </FieldGroup>

              <FieldGroup className="gap-2">
                <FieldLabel>Itens</FieldLabel>
                <div className="grid gap-2">
                  {itemRows.map((_, index) => {
                    const item = editingOrder?.items[index];
                    return (
                      <div
                        key={index}
                        className="grid gap-2 md:grid-cols-[110px_1fr]"
                      >
                        <Input
                          name="itemQuantity"
                          type="number"
                          min="1"
                          defaultValue={
                            item?.quantity ?? (index === 0 ? 1 : "")
                          }
                          aria-label={`Quantidade ${index + 1}`}
                        />
                        <Input
                          name="itemDescription"
                          defaultValue={item?.description ?? ""}
                          aria-label={`Descrição ${index + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-4`}>
            <CardHeader>
              <CardTitle>Outras informações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <RadioGroup
                name="customerOrigin"
                label="Origem do cliente"
                options={customerOriginOptions}
                labels={customerOriginLabels}
                defaultValue={editingOrder?.customerOrigin}
                columns="grid-cols-1"
              />
              <RadioGroup
                name="budgetOrigin"
                label="Origem do orçamento"
                options={budgetOriginOptions}
                labels={budgetOriginLabels}
                defaultValue={editingOrder?.budgetOrigin}
                columns="grid-cols-1"
              />
              <FormField label="Observações">
                <textarea
                  name="notes"
                  defaultValue={editingOrder?.notes ?? ""}
                  className={textareaClass}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className={`${sectionCardClass} lg:col-span-12`}>
            <CardHeader>
              <CardTitle>Montagem</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(220px,320px)_180px_1fr]">
              <RadioGroup
                name="priority"
                label="Prioridade da montagem"
                options={priorityOptions}
                labels={priorityLabels}
                defaultValue={
                  editingOrder?.assemblyOrder?.priority ?? undefined
                }
                columns="grid-cols-3"
              />
              <FormField label="Data programada">
                <Input
                  type="date"
                  name="scheduledDate"
                  defaultValue={dateInputValue(
                    editingOrder?.assemblyOrder?.scheduledDate,
                  )}
                />
              </FormField>
              <FormField label="Prazo/observação da montagem">
                <Input
                  name="scheduleNotes"
                  defaultValue={
                    editingOrder?.assemblyOrder?.scheduleNotes ?? ""
                  }
                />
              </FormField>
            </CardContent>
          </Card>
        </form>
      </section>

      <Card>
        <CardHeader className="gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <CardTitle>Ordens do mês</CardTitle>
            <CardDescription>{orders.length} registros</CardDescription>
          </div>
          <form className="flex flex-wrap items-center gap-2">
            <Input
              type="month"
              name="month"
              defaultValue={month.key}
              className="w-[180px]"
            />
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Ordem</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Vendedor</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Orçado</th>
                <th className="py-2 pr-3">Fechado</th>
                <th className="py-2 pr-3">Logística</th>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customerName}</td>
                  <td className="py-3 pr-3">{order.sellerName}</td>
                  <td className="py-3 pr-3">
                    {commercialStatusLabels[order.commercialStatus]}
                  </td>
                  <td className="py-3 pr-3">{money(order.quotedAmount)}</td>
                  <td className="py-3 pr-3">{money(order.closedAmount)}</td>
                  <td className="py-3 pr-3">
                    {logisticsTypeLabels[order.logisticsType]}
                  </td>
                  <td className="py-3 pr-3">{displayDate(order.quoteDate)}</td>
                  <td className="py-3 pr-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/vendas?month=${month.key}&edit=${order.id}`}
                      >
                        <Edit />
                        Editar
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
