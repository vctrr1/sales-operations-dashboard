"use client";

import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteSaleOrder } from "../../actions";

export function DeleteSaleOrderButton({
  orderId,
  orderNumber,
  customerName,
}: {
  orderId: string;
  orderNumber: number;
  customerName: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          aria-label={`Excluir ordem ${orderNumber}`}
          title="Excluir ordem"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Excluir ordem #{orderNumber}?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            A ordem de {customerName} e os dados de montagem relacionados serão
            excluídos permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-center!">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-base">
              Cancelar
            </Button>
          </DialogClose>
          <ActionForm action={deleteSaleOrder}>
            <input type="hidden" name="id" value={orderId} />
            <Button type="submit" variant="destructive" className="text-base">
              <Trash2 />
              Excluir ordem
            </Button>
          </ActionForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
