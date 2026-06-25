import { UserRole } from "@/generated/prisma/enums";
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
  discountedPaymentMethods,
  GENERAL_GOAL_SELLER,
  paymentMethodLabels,
} from "@/lib/domain";
import { money, parseMonth, percent, toDecimalNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { Funnel } from "lucide-react";

type SearchParams = Promise<{ month?: string }>;

type Metric = {
  sellerName: string;
  quoteCount: number;
  saleCount: number;
  totalQuoted: number;
  totalClosed: number;
  conversionCount: number;
  conversionValue: number;
  ticket: number;
  discountAverage: number;
  goalBase: number;
  goalMid: number;
  goalSuper: number;
};

function inRange(date: Date | null, start: Date, end: Date) {
  return !!date && date >= start && date < end;
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
  } satisfies Metric;
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function GoalBar({ metric }: { metric: Metric }) {
  const target = metric.goalSuper || metric.goalMid || metric.goalBase;
  const progress = target
    ? Math.min((metric.totalClosed / target) * 100, 100)
    : 0;

  return (
    <div className="grid gap-2">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span>Base {money(metric.goalBase)}</span>
        <span>Média {money(metric.goalMid)}</span>
        <span>Super {money(metric.goalSuper)}</span>
      </div>
    </div>
  );
}

export default async function SalesDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole([UserRole.SALES, UserRole.ADMIN]);
  const params = await searchParams;
  const month = parseMonth(params.month);

  const [orders, goals] = await Promise.all([
    prisma.saleOrder.findMany({
      where: {
        OR: [
          { quoteDate: { gte: month.start, lt: month.end } },
          { closedAt: { gte: month.start, lt: month.end } },
        ],
      },
      orderBy: { sellerName: "asc" },
    }),
    prisma.monthlyGoal.findMany({
      where: { month: month.start },
    }),
  ]);

  const goalsBySeller = new Map(goals.map((goal) => [goal.sellerName, goal]));
  const sellers = Array.from(
    new Set(orders.map((order) => order.sellerName)),
  ).sort();
  const generalMetric = buildMetric(
    "Geral",
    orders,
    month,
    goalsBySeller.get(GENERAL_GOAL_SELLER),
  );
  const sellerMetrics = sellers.map((seller) =>
    buildMetric(
      seller,
      orders.filter((order) => order.sellerName === seller),
      month,
      goalsBySeller.get(seller.toUpperCase()) ?? goalsBySeller.get(seller),
    ),
  );

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Indicadores</h1>
          <p className="text-sm text-muted-foreground">Comercial mensal</p>
        </div>
        <form className="flex items-center gap-2">
          <Input
            type="month"
            name="month"
            defaultValue={month.key}
            className="w-[180px]"
          />
          <Button type="submit">
            <Funnel />
            Filtrar
          </Button>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        <MetricCard
          title="Total orçado"
          value={money(generalMetric.totalQuoted)}
        />
        <MetricCard
          title="Total fechado"
          value={money(generalMetric.totalClosed)}
        />
        <MetricCard
          title="Conversão nº"
          value={percent(generalMetric.conversionCount)}
        />
        <MetricCard title="Vendas" value={String(generalMetric.saleCount)} />
        <MetricCard title="Ticket médio" value={money(generalMetric.ticket)} />
      </section>

      <Card>
        <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Meta geral</CardTitle>
          <CardDescription>
            Conversão valor {percent(generalMetric.conversionValue)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalBar metric={generalMetric} />
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {sellerMetrics.map((metric) => (
          <Card key={metric.sellerName}>
            <CardHeader className="md:grid-cols-[1fr_auto] md:items-center">
              <CardTitle>{metric.sellerName}</CardTitle>
              <CardDescription>
                Desconto médio {percent(metric.discountAverage)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-6">
                <MetricCard title="Orçado" value={money(metric.totalQuoted)} />
                <MetricCard title="Fechado" value={money(metric.totalClosed)} />
                <MetricCard
                  title="Conversão nº"
                  value={percent(metric.conversionCount)}
                />
                <MetricCard
                  title="Conversão R$"
                  value={percent(metric.conversionValue)}
                />
                <MetricCard title="Vendas" value={String(metric.saleCount)} />
                <MetricCard title="Ticket" value={money(metric.ticket)} />
              </div>
              <GoalBar metric={metric} />
            </CardContent>
          </Card>
        ))}
        {sellerMetrics.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Nenhum registro comercial no mês selecionado.
            </CardContent>
          </Card>
        ) : null}
      </section>

      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Métodos considerados para desconto médio:{" "}
          {Array.from(discountedPaymentMethods)
            .map((method) => paymentMethodLabels[method])
            .join(", ")}
        </CardContent>
      </Card>
    </div>
  );
}
