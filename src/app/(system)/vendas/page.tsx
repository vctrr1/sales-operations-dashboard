import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
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

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const textareaClass =
  "min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const labelClass = "grid gap-1.5 text-sm font-medium";

type SearchParams = Promise<{ month?: string; edit?: string }>;

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`${labelClass} ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SelectField<T extends string>({
  name,
  label,
  options,
  labels,
  defaultValue,
}: {
  name: string;
  label: string;
  options: T[];
  labels: Record<T, string>;
  defaultValue?: T;
}) {
  return (
    <Field label={label}>
      <select name={name} defaultValue={defaultValue} className={inputClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </Field>
  );
}

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

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Vendas</h1>
            <p className="text-sm text-muted-foreground">
              {editingOrder
                ? `Editando ordem ${editingOrder.orderNumber}`
                : "Novo orçamento"}
            </p>
          </div>
          <form className="flex items-center gap-2">
            <input
              type="month"
              name="month"
              defaultValue={month.key}
              className={inputClass}
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
        </div>

        <form action={saveSaleOrder} className="grid gap-5">
          {/*//serve para diferenciar criação de edição:Se id vem vazio, a action cria uma nova venda. Se id vem preenchido, a action atualiza a venda existente. */}
          <input type="hidden" name="id" value={editingOrder?.id ?? ""} />
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Vendedor">
              <select
                name="sellerName"
                required
                className={inputClass}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  Selecione um vendedor...
                </option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.name}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data do orçamento">
              <input
                type="date"
                name="quoteDate"
                required
                defaultValue={dateInputValue(
                  editingOrder?.quoteDate ?? month.start,
                )}
                className={inputClass}
              />
            </Field>
            <SelectField
              name="commercialStatus"
              label="Status"
              options={commercialStatusOptions}
              labels={commercialStatusLabels}
              defaultValue={editingOrder?.commercialStatus}
            />
            <Field label="Data do fechamento">
              <input
                type="date"
                name="closedAt"
                defaultValue={dateInputValue(editingOrder?.closedAt)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Valor orçado">
              <input
                name="quotedAmount"
                inputMode="decimal"
                required
                defaultValue={editingOrder?.quotedAmount?.toString() ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Valor fechado">
              <input
                name="closedAmount"
                inputMode="decimal"
                defaultValue={editingOrder?.closedAmount?.toString() ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Desconto (%)">
              <input
                name="discountPercent"
                inputMode="decimal"
                defaultValue={editingOrder?.discountPercent?.toString() ?? ""}
                className={inputClass}
              />
            </Field>
            <SelectField
              name="paymentMethod"
              label="Forma de pagamento"
              options={paymentMethodOptions}
              labels={paymentMethodLabels}
              defaultValue={editingOrder?.paymentMethod ?? undefined}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
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
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Cliente">
              <input
                name="customerName"
                required
                defaultValue={editingOrder?.customerName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Nome da nota">
              <input
                name="invoiceName"
                defaultValue={editingOrder?.invoiceName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Contato responsável">
              <input
                name="responsibleContact"
                defaultValue={editingOrder?.responsibleContact ?? ""}
                className={inputClass}
              />
            </Field>
            <SelectField
              name="priority"
              label="Prioridade da montagem"
              options={priorityOptions}
              labels={priorityLabels}
              defaultValue={editingOrder?.assemblyOrder?.priority ?? undefined}
            />
          </div>

          <Field label="Endereço de entrega">
            <textarea
              name="deliveryAddress"
              defaultValue={editingOrder?.deliveryAddress ?? ""}
              className={textareaClass}
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-[180px_1fr]">
            <Field label="Data programada">
              <input
                type="date"
                name="scheduledDate"
                defaultValue={dateInputValue(
                  editingOrder?.assemblyOrder?.scheduledDate,
                )}
                className={inputClass}
              />
            </Field>
            <Field label="Prazo/observação da montagem">
              <input
                name="scheduleNotes"
                defaultValue={editingOrder?.assemblyOrder?.scheduleNotes ?? ""}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium">Itens</span>
            <div className="grid gap-2">
              {itemRows.map((_, index) => {
                const item = editingOrder?.items[index];
                return (
                  <div
                    key={index}
                    className="grid gap-2 md:grid-cols-[110px_1fr]"
                  >
                    <input
                      name="itemQuantity"
                      type="number"
                      min="1"
                      defaultValue={item?.quantity ?? (index === 0 ? 1 : "")}
                      className={inputClass}
                      aria-label={`Quantidade ${index + 1}`}
                    />
                    <input
                      name="itemDescription"
                      defaultValue={item?.description ?? ""}
                      className={inputClass}
                      aria-label={`Descrição ${index + 1}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Field label="Observações">
            <textarea
              name="notes"
              defaultValue={editingOrder?.notes ?? ""}
              className={textareaClass}
            />
          </Field>

          <div className="flex justify-end">
            <Button type="submit">
              {editingOrder ? "Salvar alterações" : "Criar ordem"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ordens do mês</h2>
          <span className="text-sm text-muted-foreground">
            {orders.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
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
        </div>
      </section>
    </div>
  );
}
