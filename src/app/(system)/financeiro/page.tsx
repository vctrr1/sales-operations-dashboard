import { Save } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  assemblyStatusLabels,
  GENERAL_GOAL_SELLER,
  logisticsTypeLabels,
  priorityLabels,
} from "@/lib/domain";
import { dateInputValue, displayDate, money, monthInputValue, parseMonth } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { saveMonthlyGoal } from "../actions";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

type SearchParams = Promise<{ date?: string; month?: string }>;

function startOfUtcDay(date: string | undefined) {
  const source = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : dateInputValue(new Date());
  const start = new Date(`${source}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { key: source, start, end };
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole([UserRole.ADMIN]);
  const params = await searchParams;
  const day = startOfUtcDay(params.date);
  const month = parseMonth(params.month ?? monthInputValue());

  const [dailyOrders, goals, salesUsers] = await Promise.all([
    prisma.assemblyOrder.findMany({
      where: {
        OR: [
          { scheduledDate: { gte: day.start, lt: day.end } },
          {
            scheduledDate: null,
            requestedAt: { gte: day.start, lt: day.end },
          },
        ],
      },
      include: {
        saleOrder: {
          include: { items: true },
        },
      },
      orderBy: [{ scheduledDate: "asc" }, { requestedAt: "asc" }],
    }),
    prisma.monthlyGoal.findMany({
      where: { month: month.start },
      orderBy: { sellerName: "asc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.SALES },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const goalBySeller = new Map(goals.map((goal) => [goal.sellerName, goal]));
  const sellers = [
    { id: GENERAL_GOAL_SELLER, label: "Geral", goalKey: GENERAL_GOAL_SELLER },
    ...salesUsers.map((seller) => ({
      id: seller.id,
      label: seller.name,
      goalKey: seller.name.toUpperCase(),
    })),
  ];

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Resumo diário e metas</p>
        </div>
        <form className="grid gap-2 md:grid-cols-[180px_180px_auto]">
          <input type="date" name="date" defaultValue={day.key} className={inputClass} />
          <input type="month" name="month" defaultValue={month.key} className={inputClass} />
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
        </form>
      </section>

      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ordens do dia</h2>
          <span className="text-sm text-muted-foreground">{dailyOrders.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Ordem</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Logística</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Prioridade</th>
                <th className="py-2 pr-3">Valor</th>
                <th className="py-2 pr-3">Itens</th>
                <th className="py-2 pr-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {dailyOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 align-top">
                  <td className="py-3 pr-3 font-medium">#{order.saleOrder.orderNumber}</td>
                  <td className="py-3 pr-3">{order.saleOrder.customerName}</td>
                  <td className="py-3 pr-3">{logisticsTypeLabels[order.saleOrder.logisticsType]}</td>
                  <td className="py-3 pr-3">{assemblyStatusLabels[order.status]}</td>
                  <td className="py-3 pr-3">{priorityLabels[order.priority]}</td>
                  <td className="py-3 pr-3">{money(order.saleOrder.closedAmount)}</td>
                  <td className="py-3 pr-3">
                    {order.saleOrder.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.description}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 pr-3">{displayDate(order.scheduledDate ?? order.requestedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Metas mensais</h2>
          <span className="text-sm text-muted-foreground">{month.key}</span>
        </div>
        <div className="grid gap-3">
          {sellers.map((seller) => {
            const goal = goalBySeller.get(seller.goalKey);
            return (
              <form
                key={seller.id}
                action={saveMonthlyGoal}
                className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_160px_160px_160px_auto]"
              >
                <input type="hidden" name="month" value={month.key} />
                <input type="hidden" name="sellerName" value={seller.goalKey} />
                <label className="grid gap-1 text-sm font-medium">
                  <span>Vendedor</span>
                  <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm">
                    {seller.label}
                  </div>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  <span>Meta base</span>
                  <input
                    name="baseAmount"
                    inputMode="decimal"
                    defaultValue={goal?.baseAmount?.toString() ?? "0"}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  <span>Meta média</span>
                  <input
                    name="midAmount"
                    inputMode="decimal"
                    defaultValue={goal?.midAmount?.toString() ?? "0"}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  <span>Super meta</span>
                  <input
                    name="superAmount"
                    inputMode="decimal"
                    defaultValue={goal?.superAmount?.toString() ?? "0"}
                    className={inputClass}
                  />
                </label>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Save />
                    Salvar
                  </Button>
                </div>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
