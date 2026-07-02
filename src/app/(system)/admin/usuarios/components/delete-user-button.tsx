"use client";

import { Trash2 } from "lucide-react";
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
import { deleteUser } from "../../../actions";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  userRole?: string;
  disabled?: boolean;
};

export function DeleteUserButton({
  userId,
  userName,
  userRole,
  disabled = false,
}: DeleteUserButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="text-base"
          disabled={disabled}
          title={
            disabled ? "Você não pode apagar seu próprio usuário." : undefined
          }
        >
          <Trash2 />
          Apagar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Apagar usuário?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Essa ação remove o acesso de {userName}.
            {userRole === "SALES" &&
              " As vendas criadas por esse usuário serão mantidas no histórico."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-center!">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-base">
              Cancelar
            </Button>
          </DialogClose>
          <form action={deleteUser}>
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit" variant="destructive" className="text-base">
              <Trash2 />
              Apagar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
