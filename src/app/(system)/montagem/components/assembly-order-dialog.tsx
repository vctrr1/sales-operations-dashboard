import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AssemblyStatus,
  LogisticsType,
  Priority,
  ProductCategory,
} from "@/generated/prisma/enums";
import {
  assemblyStatusLabels,
  assemblyStatusOptions,
  logisticsTypeLabels,
  priorityLabels,
  priorityOptions,
  productCategoryLabels,
} from "@/lib/domain";
import { dateInputValue, displayDate } from "@/lib/format";
import { updateAssemblyOrder } from "../../actions";

const textareaClass =
  "min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type AssemblyOrderDialogProps = {
  assembly: {
    id: string;
    status: AssemblyStatus;
    priority: Priority;
    scheduledDate: Date | null;
    scheduleNotes: string | null;
    saleOrder: {
      orderNumber: number;
      customerName: string;
      sellerName: string;
      logisticsType: LogisticsType;
      productCategory: ProductCategory;
      deliveryAddress: string | null;
      notes: string | null;
      items: {
        id: string;
        quantity: number;
        description: string;
      }[];
    };
  };
};

export function AssemblyOrderDialog({ assembly }: AssemblyOrderDialogProps) {
  const dateText = displayDate(assembly.scheduledDate);

  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] !text-base sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="!text-lg">
          #{assembly.saleOrder.orderNumber} {assembly.saleOrder.customerName}
        </DialogTitle>
        <DialogDescription className="!text-base">
          {assembly.saleOrder.sellerName} ·{" "}
          {logisticsTypeLabels[assembly.saleOrder.logisticsType]} ·{" "}
          {assemblyStatusLabels[assembly.status]}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(100dvh-9rem)] pr-3">
        <div className="grid gap-5">
          <section className="grid gap-3 rounded-lg border p-3 text-base md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Data marcada</p>
              <p className="font-medium">{dateText}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prioridade</p>
              <p className="font-medium">{priorityLabels[assembly.priority]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Categoria</p>
              <p className="font-medium">
                {productCategoryLabels[assembly.saleOrder.productCategory]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Endereço</p>
              <p className="font-medium">
                {assembly.saleOrder.deliveryAddress ?? "Sem endereço"}
              </p>
            </div>
          </section>

          <section className="grid gap-2">
            <h3 className="text-base font-medium">Itens do pedido</h3>
            <ul className="grid gap-2 rounded-lg border p-3 text-base">
              {assembly.saleOrder.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.description}
                </li>
              ))}
            </ul>
          </section>

          {assembly.saleOrder.notes ? (
            <section className="grid gap-2">
              <h3 className="text-base font-medium">Observação comercial</h3>
              <Badge
                variant="secondary"
                className="w-fit max-w-full whitespace-normal text-base"
              >
                {assembly.saleOrder.notes}
              </Badge>
            </section>
          ) : null}

          <form action={updateAssemblyOrder} className="grid gap-3 rounded-lg border p-3">
            <input type="hidden" name="id" value={assembly.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <Select name="status" defaultValue={assembly.status}>
                <SelectTrigger className="w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assemblyStatusOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-base">
                      {assemblyStatusLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select name="priority" defaultValue={assembly.priority}>
                <SelectTrigger className="w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-base">
                      {priorityLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="date"
              name="scheduledDate"
              defaultValue={dateInputValue(assembly.scheduledDate)}
              className="text-base md:text-base"
            />
            <textarea
              name="scheduleNotes"
              defaultValue={assembly.scheduleNotes ?? ""}
              className={textareaClass}
              aria-label="Prazo ou observação"
            />
            <Button type="submit" size="sm" variant="outline">
              <Save />
              Salvar alterações
            </Button>
          </form>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
