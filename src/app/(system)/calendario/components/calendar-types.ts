import type {
  AssemblyStatus,
  CalendarEventType,
  LogisticsType,
  Priority,
  ProductCategory,
} from "@/generated/prisma/enums";
import type { Decimal } from "@prisma/client/runtime/client";

export type CalendarOrder = {
  id: string;
  status: AssemblyStatus;
  priority: Priority;
  scheduledDate: Date | null;
  requestedAt: Date;
  saleOrder: {
    orderNumber: number;
    customerName: string;
    sellerName: string;
    logisticsType: LogisticsType;
    productCategory: ProductCategory;
    closedAmount: Decimal | number | string | null;
    deliveryAddress: string | null;
    items: {
      id: string;
      quantity: number;
      description: string;
    }[];
  };
};

export type CalendarEvent = {
  id: string;
  title: string;
  notes: string | null;
  eventDate: Date;
  type: CalendarEventType;
  createdBy: {
    name: string;
  } | null;
};
