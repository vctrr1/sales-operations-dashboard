ALTER TABLE "SaleOrder"
ADD COLUMN "nfsNumber" TEXT;

ALTER TABLE "SaleOrderItem"
ADD COLUMN "isPromotional" BOOLEAN NOT NULL DEFAULT false;
