export type SalesDashboardMetric = {
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

export type SalesClosingChartItem = {
  month: string;
  monthKey: string;
  totalClosed: number;
};

export type SalesCompositionItem = {
  key: string;
  label: string;
  value: number;
};

export type SalesOperationalSummaryItem = {
  key: string;
  label: string;
  count: number;
};
