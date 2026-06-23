import type { Decimal } from "@prisma/client/runtime/client";

export function toDecimalNumber(value: Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  return Number(value);
}

export function money(value: Decimal | number | string | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toDecimalNumber(value));
}

export function percent(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}%`;
}

export function dateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function displayDate(date: Date | null | undefined) {
  if (!date) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export function monthInputValue(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function parseMonth(month?: string | null) {
  const source = month && /^\d{4}-\d{2}$/.test(month) ? month : monthInputValue();
  const [year, monthIndex] = source.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { key: source, start, end };
}

export function parseDateField(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return new Date(`${trimmed}T00:00:00.000Z`);
}

export function parseMoneyField(value: FormDataEntryValue | null, fallback = "0") {
  if (!value || typeof value !== "string") return fallback;
  const normalized = value
    .trim()
    .replace(/[R$\s.]/g, "")
    .replace(",", ".");
  return normalized || fallback;
}

export function parseOptionalText(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function parseRequiredText(value: FormDataEntryValue | null, fieldName: string) {
  const parsed = parseOptionalText(value);
  if (!parsed) throw new Error(`Campo obrigatório: ${fieldName}`);
  return parsed;
}
