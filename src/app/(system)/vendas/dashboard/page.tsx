import { AssemblyStatus, UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SalesAdminDashboard } from "../components/sales-admin-dashboard";
import { SalesSellerDashboard } from "../components/sales-seller-dashboard";
import type {
  SalesClosingChartItem,
  SalesCompositionItem,
  SalesDashboardMetric,
  SalesOperationalSummaryItem,
} from "../components/sales-dashboard-types";
import {
  assemblyStatusLabels,
  customerOriginLabels,
  discountedPaymentMethods,
  GENERAL_GOAL_SELLER,
  logisticsTypeLabels,
  productCategoryLabels,
} from "@/lib/domain";
import { displayMonth, parseMonth, toDecimalNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { Funnel } from "lucide-react";

type SearchParams = Promise<{ month?: string }>;

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: "UTC",
});

function inRange(date: Date | null, start: Date, end: Date) {
  return !!date && date >= start && date < end;
}

function addUtcMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function monthLabel(date: Date) {
  const label = MONTH_LABEL_FORMATTER.format(date).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildMetric(
  sellerName: string,
  orders: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>,
  range: { start: Date; end: Date },
  goal?: { baseAmount: unknown; midAmount: unknown; superAmount: unknown },
) {
  const quoted = orders.filter((order) =>
    inRange(order.quoteDate, range.start, range.end),
  );
  const closed = orders.filter(
    (order) =>
      order.commercialStatus === "CLOSED" &&
      inRange(order.closedAt, range.start, range.end),
  );
  const discounted = closed.filter(
    (order) =>
      order.paymentMethod && discountedPaymentMethods.has(order.paymentMethod),
  );
  const totalQuoted = quoted.reduce(
    (total, order) => total + toDecimalNumber(order.quotedAmount),
    0,
  );
  const totalClosed = closed.reduce(
    (total, order) => total + toDecimalNumber(order.closedAmount),
    0,
  );
  const discountAverage =
    discounted.length > 0
      ? discounted.reduce(
          (total, order) => total + toDecimalNumber(order.discountPercent),
          0,
        ) / discounted.length
      : 0;

  return {
    sellerName,
    quoteCount: quoted.length,
    saleCount: closed.length,
    totalQuoted,
    totalClosed,
    conversionCount: quoted.length ? (closed.length / quoted.length) * 100 : 0,
    conversionValue: totalQuoted ? (totalClosed / totalQuoted) * 100 : 0,
    ticket: closed.length ? totalClosed / closed.length : 0,
    discountAverage,
    goalBase: toDecimalNumber(goal?.baseAmount as never),
    goalMid: toDecimalNumber(goal?.midAmount as never),
    goalSuper: toDecimalNumber(goal?.superAmount as never),
  } satisfies SalesDashboardMetric;
}

function buildClosingChartData(
  orders: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>,
  selectedMonth: { start: Date },
) {
  const chartMonths = Array.from({ length: 7 }, (_, index) =>
    addUtcMonths(selectedMonth.start, index - 6),
  );
  const totalByMonth = new Map(chartMonths.map((date) => [monthKey(date), 0]));

  for (const order of orders) {
    if (!order.closedAt) continue;

    const key = monthKey(order.closedAt);
    if (!totalByMonth.has(key)) continue;

    totalByMonth.set(
      key,
      (totalByMonth.get(key) ?? 0) + toDecimalNumber(order.closedAmount),
    );
  }

  return chartMonths.map((date) => {
    const key = monthKey(date);

    return {
      month: monthLabel(date),
      monthKey: key,
      totalClosed: totalByMonth.get(key) ?? 0,
    } satisfies SalesClosingChartItem;
  });
}

function buildValueComposition(
  orders: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>,
  range: { start: Date; end: Date },
  getKey: (
    order: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>[number],
  ) => string,
  labels: Record<string, string>,
) {
  const totals = new Map<string, number>();

  for (const order of orders) {
    if (
      order.commercialStatus !== "CLOSED" ||
      !inRange(order.closedAt, range.start, range.end)
    ) {
      continue;
    }

    const key = getKey(order);
    totals.set(
      key,
      (totals.get(key) ?? 0) + toDecimalNumber(order.closedAmount),
    );
  }

  return Array.from(totals.entries())
    .map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value) satisfies SalesCompositionItem[];
}

function buildCountComposition(
  orders: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>,
  range: { start: Date; end: Date },
  getKey: (
    order: Awaited<ReturnType<typeof prisma.saleOrder.findMany>>[number],
  ) => string,
  labels: Record<string, string>,
) {
  const totals = new Map<string, number>();

  for (const order of orders) {
    if (
      order.commercialStatus !== "CLOSED" ||
      !inRange(order.closedAt, range.start, range.end)
    ) {
      continue;
    }

    const key = getKey(order);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value) satisfies SalesCompositionItem[];
}

function buildOperationalSummary(
  orders: Awaited<
    ReturnType<
      typeof prisma.saleOrder.findMany<{
        include: { assemblyOrder: true };
      }>
    >
  >,
) {
  const counts = new Map<AssemblyStatus, number>(
    Object.values(AssemblyStatus).map((status) => [status, 0]),
  );

  for (const order of orders) {
    if (!order.assemblyOrder) continue;

    counts.set(
      order.assemblyOrder.status,
      (counts.get(order.assemblyOrder.status) ?? 0) + 1,
    );
  }

  return Object.values(AssemblyStatus).map((status) => ({
    key: status,
    label:
      status === AssemblyStatus.NO_ASSEMBLY
        ? "Em montagem"
        : assemblyStatusLabels[status],
    count: counts.get(status) ?? 0,
  })) satisfies SalesOperationalSummaryItem[];
}

export default async function SalesDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole([UserRole.SALES, UserRole.ADMIN]);
  const params = await searchParams;
  const month = parseMonth(params.month);
  const isAdmin = user.role === UserRole.ADMIN;
  const sellerKey = user.name.toUpperCase();
  const previousMonth = {
    start: addUtcMonths(month.start, -1),
    end: month.start,
  };
  const chartStart = addUtcMonths(month.start, -6);

  const [orders, goals, closingChartOrders, previousOrders] = await Promise.all(
    [
      prisma.saleOrder.findMany({
        include: { assemblyOrder: true },
        where: {
          AND: [
            {
              OR: [
                { quoteDate: { gte: month.start, lt: month.end } },
                { closedAt: { gte: month.start, lt: month.end } },
              ],
            },
            ...(isAdmin
              ? []
              : [
                  {
                    sellerName: {
                      equals: user.name,
                      mode: "insensitive" as const,
                    },
                  },
                ]),
          ],
        },
        orderBy: { sellerName: "asc" },
      }),
      prisma.monthlyGoal.findMany({
        where: isAdmin
          ? { month: month.start }
          : { month: month.start, sellerName: sellerKey },
      }),
      isAdmin
        ? Promise.resolve([])
        : prisma.saleOrder.findMany({
            where: {
              commercialStatus: "CLOSED",
              closedAt: { gte: chartStart, lt: month.end },
              sellerName: {
                equals: user.name,
                mode: "insensitive",
              },
            },
            orderBy: { closedAt: "asc" },
          }),
      isAdmin
        ? Promise.resolve([])
        : prisma.saleOrder.findMany({
            where: {
              AND: [
                {
                  OR: [
                    {
                      quoteDate: {
                        gte: previousMonth.start,
                        lt: previousMonth.end,
                      },
                    },
                    {
                      closedAt: {
                        gte: previousMonth.start,
                        lt: previousMonth.end,
                      },
                    },
                  ],
                },
                {
                  sellerName: {
                    equals: user.name,
                    mode: "insensitive",
                  },
                },
              ],
            },
            orderBy: { sellerName: "asc" },
          }),
    ],
  );

  const goalsBySeller = new Map(goals.map((goal) => [goal.sellerName, goal]));
  const sellers = Array.from(
    new Set(orders.map((order) => order.sellerName)),
  ).sort();
  const generalMetric = buildMetric(
    isAdmin ? "Geral" : user.name,
    orders,
    month,
    isAdmin
      ? goalsBySeller.get(GENERAL_GOAL_SELLER)
      : goalsBySeller.get(sellerKey),
  );
  const sellerMetrics = sellers.map((seller) =>
    buildMetric(
      seller,
      orders.filter((order) => order.sellerName === seller),
      month,
      goalsBySeller.get(seller.toUpperCase()) ?? goalsBySeller.get(seller),
    ),
  );
  const closingChartData = buildClosingChartData(closingChartOrders, month);
  const categoryData = buildValueComposition(
    orders,
    month,
    (order) => order.productCategory,
    productCategoryLabels,
  );
  const customerOriginData = buildValueComposition(
    orders,
    month,
    (order) => order.customerOrigin,
    customerOriginLabels,
  );
  const logisticsData = buildCountComposition(
    orders,
    month,
    (order) => order.logisticsType,
    logisticsTypeLabels,
  );
  const operationalSummary = buildOperationalSummary(orders);
  const previousMetric = buildMetric(
    user.name,
    previousOrders,
    previousMonth,
    goalsBySeller.get(sellerKey),
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl">Indicadores</h1>
          <p className="text-base text-muted-foreground">Comercial Mensal</p>
        </div>
        <form className="flex items-center gap-2">
          <Input
            type="text"
            name="month"
            pattern="\d{2}-\d{4}"
            placeholder="mm-aaaa"
            defaultValue={displayMonth(month.key)}
            className="w-[150px] text-base md:text-base"
          />
          <Button
            type="submit"
            className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
          >
            <Funnel />
            Filtrar
          </Button>
        </form>
      </section>

      {isAdmin ? (
        <SalesAdminDashboard
          generalMetric={generalMetric}
          sellerMetrics={sellerMetrics}
          categoryData={categoryData}
          customerOriginData={customerOriginData}
          logisticsData={logisticsData}
          operationalSummary={operationalSummary}
        />
      ) : (
        <SalesSellerDashboard
          metric={generalMetric}
          previousMetric={previousMetric}
          hasOrders={orders.length > 0}
          closingChartData={closingChartData}
        />
      )}
    </div>
  );
}
