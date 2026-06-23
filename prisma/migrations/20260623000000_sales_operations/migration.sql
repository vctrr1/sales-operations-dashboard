-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PENDING', 'OPERATION', 'SALES', 'ADMIN');

-- CreateEnum
CREATE TYPE "CommercialStatus" AS ENUM ('QUOTE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'PAYMENT_LINK', 'BOLETO', 'TRANSFER', 'PIX', 'CASH');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('GEBB_ATC', 'GEBB_VERSA', 'MARCENARIA', 'CADEIRAS', 'REFORMAS', 'ACO');

-- CreateEnum
CREATE TYPE "LogisticsType" AS ENUM ('DELIVERY', 'PICKUP', 'SHOWROOM', 'VISIT_SCHEDULE');

-- CreateEnum
CREATE TYPE "AssemblyStatus" AS ENUM ('TO_SCHEDULE', 'NO_ASSEMBLY', 'ASSEMBLED', 'FINISHED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CustomerOrigin" AS ENUM ('STORE_VISIT', 'ONLINE', 'STORE_AND_ONLINE');

-- CreateEnum
CREATE TYPE "BudgetOrigin" AS ENUM ('SAME_MONTH', 'PREVIOUS_MONTH');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SaleOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "sellerName" TEXT NOT NULL,
    "commercialStatus" "CommercialStatus" NOT NULL DEFAULT 'QUOTE',
    "quoteDate" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "quotedAmount" DECIMAL(12,2) NOT NULL,
    "closedAmount" DECIMAL(12,2),
    "discountPercent" DECIMAL(5,2),
    "paymentMethod" "PaymentMethod",
    "productCategory" "ProductCategory" NOT NULL,
    "logisticsType" "LogisticsType" NOT NULL,
    "deliveryAddress" TEXT,
    "customerName" TEXT NOT NULL,
    "invoiceName" TEXT,
    "responsibleContact" TEXT,
    "customerOrigin" "CustomerOrigin" NOT NULL,
    "budgetOrigin" "BudgetOrigin" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "SaleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "saleOrderId" TEXT NOT NULL,

    CONSTRAINT "SaleOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyOrder" (
    "id" TEXT NOT NULL,
    "saleOrderId" TEXT NOT NULL,
    "status" "AssemblyStatus" NOT NULL DEFAULT 'TO_SCHEDULE',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "scheduledDate" TIMESTAMP(3),
    "scheduleNotes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssemblyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyGoal" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "sellerName" TEXT NOT NULL,
    "baseAmount" DECIMAL(12,2) NOT NULL,
    "midAmount" DECIMAL(12,2) NOT NULL,
    "superAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleOrder_orderNumber_key" ON "SaleOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SaleOrder_commercialStatus_quoteDate_idx" ON "SaleOrder"("commercialStatus", "quoteDate");

-- CreateIndex
CREATE INDEX "SaleOrder_sellerName_quoteDate_idx" ON "SaleOrder"("sellerName", "quoteDate");

-- CreateIndex
CREATE INDEX "SaleOrder_closedAt_idx" ON "SaleOrder"("closedAt");

-- CreateIndex
CREATE INDEX "SaleOrderItem_saleOrderId_idx" ON "SaleOrderItem"("saleOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyOrder_saleOrderId_key" ON "AssemblyOrder"("saleOrderId");

-- CreateIndex
CREATE INDEX "AssemblyOrder_status_orderIndex_idx" ON "AssemblyOrder"("status", "orderIndex");

-- CreateIndex
CREATE INDEX "AssemblyOrder_scheduledDate_idx" ON "AssemblyOrder"("scheduledDate");

-- CreateIndex
CREATE INDEX "MonthlyGoal_month_idx" ON "MonthlyGoal"("month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyGoal_month_sellerName_key" ON "MonthlyGoal"("month", "sellerName");

-- AddForeignKey
ALTER TABLE "SaleOrder" ADD CONSTRAINT "SaleOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItem" ADD CONSTRAINT "SaleOrderItem_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyOrder" ADD CONSTRAINT "AssemblyOrder_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
