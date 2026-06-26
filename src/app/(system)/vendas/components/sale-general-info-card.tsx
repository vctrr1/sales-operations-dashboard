"use client";

import { useMemo, useState } from "react";
import { CommercialStatus } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  commercialStatusLabels,
  commercialStatusOptions,
} from "@/lib/domain";
import { dateInputValue } from "@/lib/format";
import { FormField } from "./group-componets";

type SellerOption = {
  id: string;
  name: string;
};

type SaleGeneralInfoCardProps = {
  sellers: SellerOption[];
  sellerName?: string | null;
  quoteDate?: Date | string | null;
  commercialStatus?: CommercialStatus | null;
  closedAt?: Date | string | null;
};

function todayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function SaleGeneralInfoCard({
  sellers,
  sellerName,
  quoteDate,
  commercialStatus,
  closedAt,
}: SaleGeneralInfoCardProps) {
  const [status, setStatus] = useState<CommercialStatus>(
    commercialStatus ?? CommercialStatus.QUOTE,
  );
  const [closedDate, setClosedDate] = useState(dateInputValue(closedAt));

  const quoteDateValue = useMemo(
    () => dateInputValue(quoteDate) || todayInputValue(),
    [quoteDate],
  );

  const sellerOptions = useMemo(() => {
    if (!sellerName || sellers.some((seller) => seller.name === sellerName)) {
      return sellers;
    }

    return [{ id: "current-seller", name: sellerName }, ...sellers];
  }, [sellerName, sellers]);

  function handleStatusChange(nextStatus: CommercialStatus) {
    setStatus(nextStatus);

    if (nextStatus === CommercialStatus.CLOSED) {
      setClosedDate((currentDate) => currentDate || todayInputValue());
      return;
    }

    setClosedDate("");
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField label="Vendedor:">
          <Select name="sellerName" required defaultValue={sellerName ?? ""}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sellerOptions.map((seller) => (
                <SelectItem key={seller.id} value={seller.name}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Data do Orçamento:">
          <Input
            type="date"
            name="quoteDate"
            required
            defaultValue={quoteDateValue}
          />
        </FormField>

        <fieldset className="grid gap-2">
          <legend className="text-base leading-snug text-muted-foreground">
            Status:
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {commercialStatusOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-input px-2 py-1 text-base transition-colors has-checked:border-primary/50 has-checked:bg-primary/5 hover:bg-muted/50 dark:has-checked:bg-primary/10"
              >
                <input
                  type="radio"
                  name="commercialStatus"
                  value={option}
                  checked={option === status}
                  onChange={() => handleStatusChange(option)}
                  className="size-4 accent-primary"
                />
                <span className="leading-snug">
                  {commercialStatusLabels[option]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormField label="Data do Fechamento:">
          <Input
            type="date"
            name="closedAt"
            value={closedDate}
            onChange={(event) => setClosedDate(event.target.value)}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
