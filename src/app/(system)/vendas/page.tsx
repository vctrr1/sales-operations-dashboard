import Link from "next/link";
import { Ban, Edit, Funnel, Plus, Save } from "lucide-react";
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
  RadioGroup,
  SelectField,
  FormField,
} from "./components/group-componets";
import {
  budgetOriginLabels,
  budgetOriginOptions,
  commercialStatusLabels,
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
import { Textarea } from "@/components/ui/textarea";
import { SaleValuesCard } from "./components/sale-values-card";
import { SaleGeneralInfoCard } from "./components/sale-general-info-card";

const cardTitleClass = "text-lg";
const formTextClass =
  "text-base [&_button[data-slot=select-trigger]]:text-base [&_input]:text-base [&_textarea]:text-base";

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

  const itemRows = Array.from({
    length: Math.max(5, editingOrder?.items.length ?? 0),
  });

  const formKey = editingOrder?.id ?? "new-order";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Vendas</h1>
            <p className="text-base text-muted-foreground">
              {editingOrder
                ? `Editando ordem ${editingOrder.orderNumber}`
                : "Novo orçamento"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editingOrder ? (
              <Button asChild variant="destructive" className="text-base">
                <Link href={`/vendas?month=${month.key}`}>
                  <Ban />
                  Cancelar
                </Link>
              </Button>
            ) : null}
            <Button
              type="submit"
              form="sale-order-form"
              className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
            >
              {editingOrder ? <Save /> : <Plus />}
              {editingOrder ? "Salvar Alterações" : "Criar Ordem"}
            </Button>
          </div>
        </div>

        <form
          id="sale-order-form"
          key={formKey}
          action={saveSaleOrder}
          className={`grid gap-4 lg:grid-cols-12 ${formTextClass}`}
        >
          <input type="hidden" name="id" value={editingOrder?.id ?? ""} />
          <SaleGeneralInfoCard
            sellers={sellers}
            sellerName={editingOrder?.sellerName}
            quoteDate={editingOrder?.quoteDate}
            commercialStatus={editingOrder?.commercialStatus}
            closedAt={editingOrder?.closedAt}
          />
          <SaleValuesCard
            quotedAmount={editingOrder?.quotedAmount?.toString() ?? ""}
            closedAmount={editingOrder?.closedAmount?.toString() ?? ""}
            discountPercent={editingOrder?.discountPercent?.toString() ?? ""}
          />
          <Card className={`lg:col-span-3`}>
            <CardHeader>
              <CardTitle className={cardTitleClass}>Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="paymentMethod"
                label="Forma de Pagamento:"
                options={paymentMethodOptions}
                labels={paymentMethodLabels}
                defaultValue={editingOrder?.paymentMethod ?? undefined}
              />
            </CardContent>
          </Card>

          <Card className={` lg:col-span-3`}>
            <CardHeader>
              <CardTitle className={cardTitleClass}>
                Produto e Logística
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SelectField
                name="productCategory"
                label="Categoria do Produto:"
                options={productCategoryOptions}
                labels={productCategoryLabels}
                defaultValue={editingOrder?.productCategory}
              />
              <RadioGroup
                name="logisticsType"
                label="Logística:"
                options={logisticsTypeOptions}
                labels={logisticsTypeLabels}
                defaultValue={editingOrder?.logisticsType}
                columns="grid-cols-1"
              />
            </CardContent>
          </Card>

          <Card className={` lg:col-span-8`}>
            <CardHeader>
              <CardTitle className={cardTitleClass}>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FieldGroup className="grid gap-3 md:grid-cols-3">
                <FormField label="Cliente:">
                  <Input
                    name="customerName"
                    required
                    defaultValue={editingOrder?.customerName ?? ""}
                  />
                </FormField>
                <FormField label="Nome da Nota:" className="md:col-span-2">
                  <Input
                    name="invoiceName"
                    defaultValue={editingOrder?.invoiceName ?? ""}
                  />
                </FormField>
                <FormField label="Contato Responsável:">
                  <Input
                    name="responsibleContact"
                    defaultValue={editingOrder?.responsibleContact ?? ""}
                  />
                </FormField>
                <FormField
                  label="Endereço de Entrega:"
                  className="md:col-span-2"
                >
                  <Input
                    name="deliveryAddress"
                    defaultValue={editingOrder?.deliveryAddress ?? ""}
                  />
                </FormField>
              </FieldGroup>

              <FieldGroup className="gap-2">
                <FieldLabel className="text-base text-muted-foreground">
                  Itens:
                </FieldLabel>
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

          <Card className={` lg:col-span-4`}>
            <CardHeader>
              <CardTitle className={cardTitleClass}>
                Outras informações
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <RadioGroup
                name="customerOrigin"
                label="Origem do Cliente:"
                options={customerOriginOptions}
                labels={customerOriginLabels}
                defaultValue={editingOrder?.customerOrigin}
                columns="grid-cols-1"
              />
              <RadioGroup
                name="budgetOrigin"
                label="Origem do Orçamento:"
                options={budgetOriginOptions}
                labels={budgetOriginLabels}
                defaultValue={editingOrder?.budgetOrigin}
                columns="grid-cols-1"
              />
              <FormField label="Observações:">
                <Textarea
                  name="notes"
                  defaultValue={editingOrder?.notes ?? ""}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-12`}>
            <CardHeader>
              <CardTitle className={cardTitleClass}>Montagem</CardTitle>
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
            <CardTitle className={cardTitleClass}>Ordens do mês</CardTitle>
            <CardDescription className="text-base">
              {orders.length} registros
            </CardDescription>
          </div>
          <form className="flex flex-wrap items-center gap-2">
            <Input
              type="month"
              name="month"
              defaultValue={month.key}
              className="w-[180px] text-base md:text-base"
            />
            <Button
              type="submit"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
            >
              <Funnel />
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-base">
            <thead className="border-b text-sm uppercase text-muted-foreground">
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
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-base"
                    >
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
