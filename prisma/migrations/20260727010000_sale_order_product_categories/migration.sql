-- AlterTable
ALTER TABLE "SaleOrder" ADD COLUMN "productCategories" "ProductCategory"[] NOT NULL DEFAULT ARRAY[]::"ProductCategory"[];

-- DataMigration
UPDATE "SaleOrder"
SET "productCategories" = ARRAY["productCategory"]::"ProductCategory"[];

-- AlterTable
ALTER TABLE "SaleOrder" DROP COLUMN "productCategory";
