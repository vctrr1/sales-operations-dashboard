import { NextRequest, NextResponse } from "next/server";
import { AssemblyStatus, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await requireRole([UserRole.OPERATION]);

  const after = request.nextUrl.searchParams.get("after");
  const afterDate = after ? new Date(after) : null;

  if (!afterDate || Number.isNaN(afterDate.getTime())) {
    return NextResponse.json(
      { error: "Parâmetro after inválido." },
      { status: 400 },
    );
  }

  const orders = await prisma.assemblyOrder.findMany({
    where: {
      status: AssemblyStatus.TO_SCHEDULE,
      requestedAt: {
        gt: afterDate,
      },
    },
    select: {
      id: true,
      requestedAt: true,
      saleOrder: {
        select: {
          orderNumber: true,
          customerName: true,
          sellerName: true,
        },
      },
    },
    orderBy: {
      requestedAt: "asc",
    },
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      requestedAt: order.requestedAt.toISOString(),
      orderNumber: order.saleOrder.orderNumber,
      customerName: order.saleOrder.customerName,
      sellerName: order.saleOrder.sellerName,
    })),
  });
}
