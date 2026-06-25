import Link from "next/link";
import { Edit, Plus } from "lucide-react";
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
      <Card>
        <CardHeader className="gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <CardTitle>Vendas</CardTitle>
            <CardDescription>
              {editingOrder
                ? `Editando ordem ${editingOrder.orderNumber}`
                : "Novo orçamento"}
            </CardDescription>
          </div>
          <form className="flex items-center gap-2">
            <Input
              type="month"
              name="month"
              defaultValue={month.key}
              className="w-[180px]"
            />
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
            {editingOrder ? (
              <Button asChild variant="outline">
                <Link href={`/vendas?month=${month.key}`}>
                  <Plus />
                  Novo
                </Link>
              </Button>
            ) : null}
          </form>
        </CardHeader>

        <CardContent>
          <form key={formKey} action={saveSaleOrder} className="grid gap-5">
            <input type="hidden" name="id" value={editingOrder?.id ?? ""} />
            <FieldGroup className="grid gap-3 md:grid-cols-4">
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
              <SelectField
                name="commercialStatus"
                label="Status"
                options={commercialStatusOptions}
                labels={commercialStatusLabels}
                defaultValue={editingOrder?.commercialStatus}
              />
              <FormField label="Data do fechamento">
                <Input
                  type="date"
                  name="closedAt"
                  defaultValue={dateInputValue(editingOrder?.closedAt)}
                />
              </FormField>
            </FieldGroup>

            <FieldGroup className="grid gap-3 md:grid-cols-4">
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
              <SelectField
                name="paymentMethod"
                label="Forma de pagamento"
                options={paymentMethodOptions}
                labels={paymentMethodLabels}
                defaultValue={editingOrder?.paymentMethod ?? undefined}
              />
            </FieldGroup>

            <FieldGroup className="grid gap-3 md:grid-cols-4">
              <SelectField
                name="productCategory"
                label="Categoria"
                options={productCategoryOptions}
                labels={productCategoryLabels}
                defaultValue={editingOrder?.productCategory}
              />
              <SelectField
                name="logisticsType"
                label="Logística"
                options={logisticsTypeOptions}
                labels={logisticsTypeLabels}
                defaultValue={editingOrder?.logisticsType}
              />
              <SelectField
                name="customerOrigin"
                label="Origem do cliente"
                options={customerOriginOptions}
                labels={customerOriginLabels}
                defaultValue={editingOrder?.customerOrigin}
              />
              <SelectField
                name="budgetOrigin"
                label="Origem do orçamento"
                options={budgetOriginOptions}
                labels={budgetOriginLabels}
                defaultValue={editingOrder?.budgetOrigin}
              />
            </FieldGroup>

            <FieldGroup className="grid gap-3 md:grid-cols-4">
              <FormField label="Cliente">
                <Input
                  name="customerName"
                  required
                  defaultValue={editingOrder?.customerName ?? ""}
                />
              </FormField>
              <FormField label="Nome da nota">
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
              <SelectField
                name="priority"
                label="Prioridade da montagem"
                options={priorityOptions}
                labels={priorityLabels}
                defaultValue={
                  editingOrder?.assemblyOrder?.priority ?? undefined
                }
              />
            </FieldGroup>

            <FormField label="Endereço de entrega">
              <textarea
                name="deliveryAddress"
                defaultValue={editingOrder?.deliveryAddress ?? ""}
                className={textareaClass}
              />
            </FormField>

            <FieldGroup className="grid gap-3 md:grid-cols-[180px_1fr]">
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
                        defaultValue={item?.quantity ?? (index === 0 ? 1 : "")}
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

            <FormField label="Observações">
              <textarea
                name="notes"
                defaultValue={editingOrder?.notes ?? ""}
                className={textareaClass}
              />
            </FormField>

            <div className="flex justify-end">
              <Button type="submit">
                {editingOrder ? "Salvar alterações" : "Criar ordem"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Ordens do mês</CardTitle>
          <CardDescription>{orders.length} registros</CardDescription>
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
