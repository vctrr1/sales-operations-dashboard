"use client";

import { useRef, useState } from "react";
import { PaymentMethod } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  discountedPaymentMethods,
  paymentMethodLabels,
  paymentMethodOptions,
} from "@/lib/domain";
import { RadioGroup } from "./group-componets";
import {
  SaleValuesCard,
  type SaleValuesCardRef,
} from "./sale-values-card";

type SalePaymentValuesSectionProps = {
  quotedAmount?: string;
  closedAmount?: string;
  discountPercent?: string;
  paymentMethod?: PaymentMethod | null;
};

export function SalePaymentValuesSection({
  quotedAmount = "",
  closedAmount = "",
  discountPercent = "",
  paymentMethod,
}: SalePaymentValuesSectionProps) {
  const valuesCardRef = useRef<SaleValuesCardRef>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(paymentMethod ?? PaymentMethod.CARD);
  const discountEnabled = discountedPaymentMethods.has(selectedPaymentMethod);

  function handlePaymentMethodChange(nextPaymentMethod: PaymentMethod) {
    setSelectedPaymentMethod(nextPaymentMethod);

    if (!discountedPaymentMethods.has(nextPaymentMethod)) {
      valuesCardRef.current?.clearDiscountForDisabledPayment();
    }
  }

  return (
    <>
      <SaleValuesCard
        ref={valuesCardRef}
        quotedAmount={quotedAmount}
        closedAmount={closedAmount}
        discountPercent={discountPercent}
        discountEnabled={discountEnabled}
      />

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            name="paymentMethod"
            label="Forma de Pagamento:"
            options={paymentMethodOptions}
            labels={paymentMethodLabels}
            value={selectedPaymentMethod}
            onValueChange={handlePaymentMethodChange}
          />
        </CardContent>
        <CardDescription>
          {!discountEnabled ? (
            <p className="text-sm text-muted-foreground text-center">
              Desconto disponível apenas para Pix, transferência, boleto ou
              espécie.
            </p>
          ) : null}
        </CardDescription>
      </Card>
    </>
  );
}
