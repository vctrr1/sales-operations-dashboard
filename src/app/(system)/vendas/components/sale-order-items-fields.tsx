"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type SaleItemValue = {
  quantity: number;
  description: string;
  isPromotional: boolean;
};

export function SaleOrderItemsFields({ items }: { items: SaleItemValue[] }) {
  const [rowCount, setRowCount] = useState(Math.max(4, items.length));

  return (
    <>
      <div className="grid gap-2">
        {Array.from({ length: rowCount }, (_, index) => {
          const item = items[index];

          return (
            <div
              key={index}
              className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[110px_minmax(0,1fr)_auto]"
            >
              <Input
                name="itemQuantity"
                type="number"
                min="1"
                defaultValue={item?.quantity ?? (index === 0 ? 1 : "")}
                aria-label={`Quantidade ${index + 1}`}
              />
              <Input
                name="itemDescription"
                defaultValue={item?.description ?? ""}
                aria-label={`Descrição ${index + 1}`}
              />
              <div className="flex items-center gap-2 whitespace-nowrap text-base text-muted-foreground">
                <Switch
                  id={`itemPromotional-${index}`}
                  name={`itemPromotional-${index}`}
                  value="true"
                  defaultChecked={item?.isPromotional ?? false}
                  aria-label={`Item ${index + 1} promocional`}
                />
                Promocional
              </div>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
        onClick={() => setRowCount((count) => count + 1)}
      >
        <Plus />
        Adicionar item
      </Button>
    </>
  );
}
