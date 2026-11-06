import Link from "next/link";
import { Ban, Edit, Funnel, Plus, Save } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import {
  ActionFieldError,
  ActionForm,
  ActionFormError,
} from "@/components/action-form";
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
import { RadioGroup, FormField } from "./components/group-componets";
import {
  budgetOriginLabels,
  budgetOriginOptions,
  commercialStatusLabels,
  customerOriginLabels,
  customerOriginOptions,
  logisticsTypeLabels,
  logisticsTypeOptions,
  priorityLabels,
  priorityOptions,
  productCategoryLabels,
  productCategoryOptions,
} from "@/lib/domain";
import {
  dateInputValue,
  displayDate,
  displayMonth,
  money,
  parseMonth,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { saveSaleOrder } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { SaleGeneralInfoCard } from "./components/sale-general-info-card";
import { SalePaymentValuesSection } from "./components/sale-payment-values-section";
import { ProductCategoryMultiSelect } from "./components/product-category-multi-select";
import { Switch } from "@/components/ui/switch";
import { DeleteSaleOrderButton } from "./components/delete-sale-order-button";
import { SaleOrderItemsFields } from "./components/sale-order-items-fields";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const cardTitleClass = "text-lg";
const formTextClass =
  "text-base [&_button[data-slot=select-trigger]]:text-base [&_input]:text-base [&_textarea]:text-base";
const ORDERS_PER_PAGE = 15;

type SearchParams = Promise<{
  month?: string;
  edit?: string;
  promotional?: string;
  page?: string;
}>;

export default async function SalesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole([UserRole.SALES, UserRole.ADMIN]);
  const params = await searchParams;
  const month = parseMonth(params.month);
  const promotionalOnly = params.promotional === "1";
  const requestedPage = Number(params.page ?? 1);
  const requestedPageNumber =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const orderWhere = {
    ...(promotionalOnly
      ? { items: { some: { isPromotional: true } } }
      : {}),
    quoteDate: {
      gte: month.start,
      lt: month.end,
    },
  };

  const [orderCount, editingOrder, sellers] = await Promise.all([
    prisma.saleOrder.count({ where: orderWhere }),
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
  const totalPages = Math.max(1, Math.ceil(orderCount / ORDERS_PER_PAGE));
  const currentPage = Math.min(requestedPageNumber, totalPages);
  const orders = await prisma.saleOrder.findMany({
    where: orderWhere,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      sellerName: true,
      commercialStatus: true,
      quotedAmount: true,
      closedAmount: true,
      logisticsType: true,
      nfsNumber: true,
      quoteDate: true,
    },
    orderBy: [{ quoteDate: "desc" }, { orderNumber: "desc" }],
    skip: (currentPage - 1) * ORDERS_PER_PAGE,
    take: ORDERS_PER_PAGE,
  });
  const paginationHref = (page: number) =>
    `/vendas?month=${month.key}${promotionalOnly ? "&promotional=1" : ""}&page=${page}`;
  const visiblePages = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (page) => page >= 1 && page <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);

  const formKey = editingOrder?.id ?? "new-order";

  return (
    <div className="grid gap-6 max-w-375 px-4 mx-auto">
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl">Vendas</h1>
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

        <ActionForm
          id="sale-order-form"
          key={formKey}
          action={saveSaleOrder}
          errorToast={false}
          resetOnSuccess={!editingOrder}
          className={`grid gap-4 lg:grid-cols-12 ${formTextClass}`}
        >
          <ActionFormError className="lg:col-span-12" />
          <input type="hidden" name="id" value={editingOrder?.id ?? ""} />
          <SaleGeneralInfoCard
            sellers={sellers}
            sellerName={editingOrder?.sellerName}
            quoteDate={editingOrder?.quoteDate}
            commercialStatus={editingOrder?.commercialStatus}
            closedAt={editingOrder?.closedAt}
          />
          <SalePaymentValuesSection
            quotedAmount={editingOrder?.quotedAmount?.toString() ?? ""}
            closedAmount={editingOrder?.closedAmount?.toString() ?? ""}
            discountPercent={editingOrder?.discountPercent?.toString() ?? ""}
            paymentMethod={editingOrder?.paymentMethod}
          />
          <Card className="min-w-0 lg:col-span-3">
            <CardHeader>
              <CardTitle className={cardTitleClass}>
                Produto e Logística
              </CardTitle>
            </CardHeader>
            <CardContent className="grid min-w-0 gap-4">
              <ProductCategoryMultiSelect
                name="productCategories"
                label="Categoria do Produto:"
                options={productCategoryOptions}
                labels={productCategoryLabels}
                defaultValues={editingOrder?.productCategories ?? []}
                nfsNumber={editingOrder?.nfsNumber ?? ""}
              />
              <ActionFieldError name="productCategories" />
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
                  <ActionFieldError name="customerName" />
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
                <SaleOrderItemsFields items={editingOrder?.items ?? []} />
                <ActionFieldError name="items" />
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
              <FormField label="Observações Comerciais:">
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
                label="Prioridade da Montagem:"
                options={priorityOptions}
                labels={priorityLabels}
                defaultValue={editingOrder?.assemblyOrder?.priority ?? "MEDIUM"}
                columns="grid-cols-3"
              />
              <FormField label="Data Programada:">
                <Input
                  type="date"
                  name="scheduledDate"
                  defaultValue={dateInputValue(
                    editingOrder?.assemblyOrder?.scheduledDate,
                  )}
                />
              </FormField>
              <FormField label="Prazo/Observação da Montagem:">
                <Input
                  name="scheduleNotes"
                  defaultValue={
                    editingOrder?.assemblyOrder?.scheduleNotes ?? ""
                  }
                />
              </FormField>
            </CardContent>
          </Card>
        </ActionForm>
      </section>

      <Card>
        <CardHeader className="gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <CardTitle className={cardTitleClass}>Ordens do mês</CardTitle>
            <CardDescription className="text-base">
              {orderCount} registros
              {promotionalOnly ? " promocionais" : ""}
            </CardDescription>
          </div>
          <form className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              name="month"
              pattern="\d{2}-\d{4}"
              placeholder="mm-aaaa"
              defaultValue={displayMonth(month.key)}
              className="w-37.5 text-base md:text-base"
            />
            <label
              htmlFor="promotional-filter"
              className="flex items-center gap-2 whitespace-nowrap text-base"
            >
              <Switch
                id="promotional-filter"
                name="promotional"
                value="1"
                defaultChecked={promotionalOnly}
              />
              Itens promocionais
            </label>
            <input type="hidden" name="page" value="1" />
            <Button
              type="submit"
              className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
            >
              <Funnel />
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-230 text-left text-base">
            <thead className="border-b text-sm uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Ordem</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Vendedor</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Orçado</th>
                <th className="py-2 pr-3">Fechado</th>
                <th className="py-2 pr-3">Logística</th>
                <th className="py-2 pr-3">NFS</th>
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
                  <td className="py-3 pr-3">{order.nfsNumber ?? "—"}</td>
                  <td className="py-3 pr-3">{displayDate(order.quoteDate)}</td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        aria-label={`Editar ordem ${order.orderNumber}`}
                        title="Editar ordem"
                      >
                        <Link
                          href={`/vendas?month=${month.key}${promotionalOnly ? "&promotional=1" : ""}&page=${currentPage}&edit=${order.id}`}
                        >
                          <Edit />
                        </Link>
                      </Button>
                      {user.role === UserRole.ADMIN ? (
                        <DeleteSaleOrderButton
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          customerName={order.customerName}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 ? (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={paginationHref(Math.max(1, currentPage - 1))}
                    text="Anterior"
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    className={
                      currentPage === 1
                        ? "pointer-events-none text-base opacity-50"
                        : "text-base"
                    }
                  />
                </PaginationItem>
                {visiblePages.map((page, index) => (
                  <PaginationItem key={page}>
                    {index > 0 && page - visiblePages[index - 1] > 1 ? (
                      <PaginationEllipsis />
                    ) : null}
                    <PaginationLink
                      href={paginationHref(page)}
                      isActive={page === currentPage}
                      aria-label={`Página ${page}`}
                      className="text-base"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={paginationHref(
                      Math.min(totalPages, currentPage + 1),
                    )}
                    text="Próxima"
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none text-base opacity-50"
                        : "text-base"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
