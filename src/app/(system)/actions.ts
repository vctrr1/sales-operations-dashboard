"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AssemblyStatus,
  BudgetOrigin,
  CommercialStatus,
  CustomerOrigin,
  LogisticsType,
  PaymentMethod,
  Priority,
  ProductCategory,
  UserRole,
} from "@/generated/prisma/enums";
import { GENERAL_GOAL_SELLER } from "@/lib/domain";
import {
  parseDateField,
  parseMoneyField,
  parseMonth,
  parseOptionalText,
  parseRequiredText,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

function enumValue<T extends Record<string, string>>(
  source: T,
  value: FormDataEntryValue | null,
  fallback: T[keyof T],
) {
  if (typeof value !== "string") return fallback;
  return Object.values(source).includes(value) ? (value as T[keyof T]) : fallback;
}

function parseItems(formData: FormData) {
  const quantities = formData.getAll("itemQuantity");
  const descriptions = formData.getAll("itemDescription");

  const items = descriptions
    .map((description, index) => {
      const text = typeof description === "string" ? description.trim() : "";
      const rawQuantity = quantities[index];
      const quantity =
        typeof rawQuantity === "string" ? Number.parseInt(rawQuantity, 10) : 0;
      return { quantity: Number.isFinite(quantity) ? quantity : 0, description: text };
    })
    .filter((item) => item.description && item.quantity > 0);

  if (items.length === 0) {
    throw new Error("Informe ao menos um item com quantidade e descrição.");
  }

  return items;
}

export async function saveSaleOrder(formData: FormData) {
  const user = await requireRole([UserRole.SALES, UserRole.ADMIN]);
  const id = parseOptionalText(formData.get("id"));
  const commercialStatus = enumValue(
    CommercialStatus,
    formData.get("commercialStatus"),
    CommercialStatus.QUOTE,
  );
  const quoteDate = parseDateField(formData.get("quoteDate")) ?? new Date();
  const closedAt = parseDateField(formData.get("closedAt"));
  const items = parseItems(formData);

  const data = {
    sellerName: parseRequiredText(formData.get("sellerName"), "vendedor"),
    commercialStatus,
    quoteDate,
    closedAt: commercialStatus === CommercialStatus.CLOSED ? closedAt ?? quoteDate : null,
    quotedAmount: parseMoneyField(formData.get("quotedAmount")),
    closedAmount:
      commercialStatus === CommercialStatus.CLOSED
        ? parseMoneyField(formData.get("closedAmount"), parseMoneyField(formData.get("quotedAmount")))
        : null,
    discountPercent: parseOptionalText(formData.get("discountPercent"))
      ? parseMoneyField(formData.get("discountPercent"))
      : null,
    paymentMethod:
      commercialStatus === CommercialStatus.CLOSED
        ? enumValue(PaymentMethod, formData.get("paymentMethod"), PaymentMethod.CARD)
        : null,
    productCategory: enumValue(
      ProductCategory,
      formData.get("productCategory"),
      ProductCategory.CADEIRAS,
    ),
    logisticsType: enumValue(LogisticsType, formData.get("logisticsType"), LogisticsType.DELIVERY),
    deliveryAddress: parseOptionalText(formData.get("deliveryAddress")),
    customerName: parseRequiredText(formData.get("customerName"), "cliente"),
    invoiceName: parseOptionalText(formData.get("invoiceName")),
    responsibleContact: parseOptionalText(formData.get("responsibleContact")),
    customerOrigin: enumValue(
      CustomerOrigin,
      formData.get("customerOrigin"),
      CustomerOrigin.STORE_VISIT,
    ),
    budgetOrigin: enumValue(BudgetOrigin, formData.get("budgetOrigin"), BudgetOrigin.SAME_MONTH),
    notes: parseOptionalText(formData.get("notes")),
  };

  const priority = enumValue(Priority, formData.get("priority"), Priority.MEDIUM);
  const scheduledDate = parseDateField(formData.get("scheduledDate"));
  const scheduleNotes = parseOptionalText(formData.get("scheduleNotes"));

  await prisma.$transaction(async (tx) => {
    const saleOrder = id
      ? await tx.saleOrder.update({
          where: { id },
          data: {
            ...data,
            items: {
              deleteMany: {},
              createMany: { data: items },
            },
          },
        })
      : await tx.saleOrder.create({
          data: {
            ...data,
            createdById: user.id,
            items: { createMany: { data: items } },
          },
        });

    if (commercialStatus === CommercialStatus.CLOSED) {
      await tx.assemblyOrder.upsert({
        where: { saleOrderId: saleOrder.id },
        create: {
          saleOrderId: saleOrder.id,
          priority,
          scheduledDate,
          scheduleNotes,
        },
        update: {
          priority,
          scheduledDate,
          scheduleNotes,
        },
      });
    } else {
      await tx.assemblyOrder.deleteMany({
        where: { saleOrderId: saleOrder.id },
      });
    }
  });

  revalidatePath("/vendas");
  revalidatePath("/vendas/dashboard");
  revalidatePath("/montagem");
  revalidatePath("/financeiro");
  redirect("/vendas");
}

export async function updateAssemblyOrder(formData: FormData) {
  await requireRole([UserRole.OPERATION, UserRole.ADMIN]);

  const id = parseRequiredText(formData.get("id"), "ordem de montagem");

  await prisma.assemblyOrder.update({
    where: { id },
    data: {
      status: enumValue(AssemblyStatus, formData.get("status"), AssemblyStatus.TO_SCHEDULE),
      priority: enumValue(Priority, formData.get("priority"), Priority.MEDIUM),
      scheduledDate: parseDateField(formData.get("scheduledDate")),
      scheduleNotes: parseOptionalText(formData.get("scheduleNotes")),
    },
  });

  revalidatePath("/montagem");
  revalidatePath("/financeiro");
}

export async function saveMonthlyGoal(formData: FormData) {
  await requireRole([UserRole.ADMIN]);

  const { start } = parseMonth(parseOptionalText(formData.get("month")));
  const sellerName =
    parseOptionalText(formData.get("sellerName"))?.toUpperCase() ?? GENERAL_GOAL_SELLER;

  await prisma.monthlyGoal.upsert({
    where: {
      month_sellerName: {
        month: start,
        sellerName,
      },
    },
    create: {
      month: start,
      sellerName,
      baseAmount: parseMoneyField(formData.get("baseAmount")),
      midAmount: parseMoneyField(formData.get("midAmount")),
      superAmount: parseMoneyField(formData.get("superAmount")),
    },
    update: {
      baseAmount: parseMoneyField(formData.get("baseAmount")),
      midAmount: parseMoneyField(formData.get("midAmount")),
      superAmount: parseMoneyField(formData.get("superAmount")),
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/vendas/dashboard");
}

export async function updateUserRole(formData: FormData) {
  await requireRole([UserRole.ADMIN]);

  const userId = parseRequiredText(formData.get("userId"), "usuário");
  const role = enumValue(UserRole, formData.get("role"), UserRole.PENDING);

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/usuarios");
}
