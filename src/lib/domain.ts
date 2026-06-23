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

export const GENERAL_GOAL_SELLER = "GERAL";

export const roleLabels: Record<UserRole, string> = {
  PENDING: "Pendente",
  OPERATION: "Operação",
  SALES: "Vendas",
  ADMIN: "Financeiro/Admin",
};

export const commercialStatusLabels: Record<CommercialStatus, string> = {
  QUOTE: "Orçado",
  CLOSED: "Fechado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CARD: "Cartão",
  PAYMENT_LINK: "Link de pagamento",
  BOLETO: "Boleto",
  TRANSFER: "Transferência",
  PIX: "Pix",
  CASH: "Espécie",
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  GEBB_ATC: "Móveis Gebb Work - Linha ATC",
  GEBB_VERSA: "Móveis Gebb Work - Linha Versa",
  MARCENARIA: "Móveis de Marcenaria",
  CADEIRAS: "Cadeiras",
  REFORMAS: "Reformas",
  ACO: "Móveis de Aço",
};

export const logisticsTypeLabels: Record<LogisticsType, string> = {
  DELIVERY: "Entrega",
  PICKUP: "Retirada",
  SHOWROOM: "Mostruário",
  VISIT_SCHEDULE: "Agendamento de visita",
};

export const assemblyStatusLabels: Record<AssemblyStatus, string> = {
  TO_SCHEDULE: "A programar",
  NO_ASSEMBLY: "Em montagem",
  ASSEMBLED: "Montado",
  FINISHED: "Finalizado",
  DELIVERED: "Entregue",
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};

export const customerOriginLabels: Record<CustomerOrigin, string> = {
  STORE_VISIT: "Visita à loja",
  ONLINE: "Online",
  STORE_AND_ONLINE: "Visita e online",
};

export const budgetOriginLabels: Record<BudgetOrigin, string> = {
  SAME_MONTH: "Orçamento do mesmo mês",
  PREVIOUS_MONTH: "Proveniente de outro mês",
};

export const roleOptions = Object.values(UserRole);
export const commercialStatusOptions = Object.values(CommercialStatus);
export const paymentMethodOptions = Object.values(PaymentMethod);
export const productCategoryOptions = Object.values(ProductCategory);
export const logisticsTypeOptions = Object.values(LogisticsType);
export const assemblyStatusOptions = Object.values(AssemblyStatus);
export const priorityOptions = Object.values(Priority);
export const customerOriginOptions = Object.values(CustomerOrigin);
export const budgetOriginOptions = Object.values(BudgetOrigin);

export const discountedPaymentMethods = new Set<PaymentMethod>([
  PaymentMethod.CASH,
  PaymentMethod.PIX,
  PaymentMethod.TRANSFER,
]);
