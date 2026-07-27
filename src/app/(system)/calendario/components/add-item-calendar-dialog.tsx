import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

function AddItemCalendarDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50">
          <PlusIcon />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Adicionar Nota</DialogTitle>
        <DialogDescription>
          Aqui você pode adicionar notas para entrega / visita / montagem e etc.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default AddItemCalendarDialog;
