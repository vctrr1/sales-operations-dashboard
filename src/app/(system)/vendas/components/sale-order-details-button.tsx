"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AssemblyOrderDialog,
  type AssemblyOrderDialogData,
} from "../../montagem/components/assembly-order-dialog";

export function SaleOrderDetailsButton({
  assembly,
}: {
  assembly: AssemblyOrderDialogData;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Ver detalhes da ordem ${assembly.saleOrder.orderNumber}`}
          title="Ver detalhes"
        >
          <Eye />
        </Button>
      </DialogTrigger>
      <AssemblyOrderDialog assembly={assembly} readOnly />
    </Dialog>
  );
}
