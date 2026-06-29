"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "./group-componets";

function parseBrazilianNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  const normalized = trimmed
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  return Number(normalized);
}

function formatBrazilianMoneyValue(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatInitialMoneyValue(value: string) {
  const parsed = parseBrazilianNumber(value);
  return Number.isFinite(parsed) ? formatBrazilianMoneyValue(parsed) : value;
}

type SaleValuesCardProps = {
  quotedAmount?: string;
  closedAmount?: string;
  discountPercent?: string;
  discountEnabled?: boolean;
};

export type SaleValuesCardRef = {
  clearDiscountForDisabledPayment: () => void;
};

export const SaleValuesCard = forwardRef<SaleValuesCardRef, SaleValuesCardProps>(
function SaleValuesCard(
  {
    quotedAmount = "",
    closedAmount = "",
    discountPercent = "",
    discountEnabled = true,
  },
  ref,
) {
  const [quotedValue, setQuotedValue] = useState(() =>
    formatInitialMoneyValue(quotedAmount),
  );
  const [closedValue, setClosedValue] = useState(() =>
    formatInitialMoneyValue(closedAmount),
  );
  const [discountValue, setDiscountValue] = useState(discountPercent);
  const [lastCalculatedClosedValue, setLastCalculatedClosedValue] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      clearDiscountForDisabledPayment() {
        setDiscountValue("");
        setMessage(null);
        setClosedValue((currentValue) =>
          currentValue && currentValue === lastCalculatedClosedValue
            ? formatInitialMoneyValue(quotedValue)
            : currentValue,
        );
        setLastCalculatedClosedValue(null);
      },
    }),
    [lastCalculatedClosedValue, quotedValue],
  );

  function calculateDiscount() {
    if (!discountEnabled) {
      setMessage("Desconto disponível apenas para pagamento à vista.");
      return;
    }

    const quoted = parseBrazilianNumber(quotedValue);
    const discount = discountValue.trim()
      ? parseBrazilianNumber(discountValue)
      : 0;

    if (!Number.isFinite(quoted) || quoted < 0) {
      setMessage("Informe um valor orçado válido para calcular.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0) {
      setMessage("Informe um desconto válido.");
      return;
    }

    const calculated = quoted - quoted * (discount / 100);
    const nextClosedValue = formatBrazilianMoneyValue(Math.max(calculated, 0));

    setClosedValue(nextClosedValue);
    setLastCalculatedClosedValue(nextClosedValue);
    setMessage(null);
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Valores</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField label="Valor Orçado:">
          <Input
            name="quotedAmount"
            inputMode="decimal"
            required
            value={quotedValue}
            onChange={(event) => setQuotedValue(event.target.value)}
          />
        </FormField>
        <FormField label="Desconto (%):">
          <Input
            name="discountPercent"
            inputMode="decimal"
            value={discountValue}
            disabled={!discountEnabled}
            onChange={(event) => setDiscountValue(event.target.value)}
          />
        </FormField>
        <FormField label="Valor Fechado:">
          <Input
            name="closedAmount"
            inputMode="decimal"
            value={closedValue}
            onChange={(event) => {
              setClosedValue(event.target.value);
              setLastCalculatedClosedValue(null);
            }}
          />
        </FormField>
        <div className="grid gap-2">
          <Button
            className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
            type="button"
            variant="default"
            disabled={!discountEnabled}
            onClick={calculateDiscount}
          >
            <Calculator />
            Calcular Desconto
          </Button>
          {message ? (
            <p className="text-sm text-destructive" role="alert">
              {message}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
});

SaleValuesCard.displayName = "SaleValuesCard";
