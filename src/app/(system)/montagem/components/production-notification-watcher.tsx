"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";
import useSound from "use-sound";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type NotificationOrder = {
  id: string;
  requestedAt: string;
  orderNumber: number;
  customerName: string;
  sellerName: string;
};

type NotificationResponse = {
  orders: NotificationOrder[];
};

function latestRequestedAt(orders: NotificationOrder[]) {
  return orders.reduce((latest, order) => {
    return new Date(order.requestedAt).getTime() > new Date(latest).getTime()
      ? order.requestedAt
      : latest;
  }, orders[0]?.requestedAt ?? new Date().toISOString());
}

export function ProductionNotificationWatcher({
  initialCursor,
}: {
  initialCursor: string;
}) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const cursorRef = useRef(initialCursor);
  const inFlightRef = useRef(false);
  const [play] = useSound("/sounds/production-new-order.mp3", {
    volume: 0.6,
    interrupt: true,
    soundEnabled,
  });

  useEffect(() => {
    async function checkForNewOrders() {
      if (inFlightRef.current) return;

      inFlightRef.current = true;

      try {
        const response = await fetch(
          `/api/montagem/notifications?after=${encodeURIComponent(
            cursorRef.current,
          )}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as NotificationResponse;
        if (data.orders.length === 0) return;

        cursorRef.current = latestRequestedAt(data.orders);

        if (soundEnabled) {
          play();
        }

        const firstOrder = data.orders[0];
        toast.success(
          data.orders.length === 1
            ? "Novo pedido chegou."
            : `${data.orders.length} Novos pedidos chegaram.`,
          {
            description:
              data.orders.length === 1 && firstOrder
                ? `#${firstOrder.orderNumber} ${firstOrder.customerName}`
                : "A coluna A programar recebeu novos pedidos.",
          },
        );

        router.refresh();
      } catch {
        return;
      } finally {
        inFlightRef.current = false;
      }
    }

    const interval = window.setInterval(checkForNewOrders, 15_000);

    return () => window.clearInterval(interval);
  }, [play, router, soundEnabled]);

  if (soundEnabled) return null;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-base text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-2">
        <BellRing className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Notificações sonoras da produção</p>
          <p className="text-sm text-sky-800/80 dark:text-sky-100/70">
            Ative para tocar um alerta quando chegar pedido em A programar.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="border-sky-300 bg-background text-base text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-100 dark:hover:bg-sky-950"
        onClick={() => {
          setSoundEnabled(true);
          toast.success("Notificações sonoras ativadas.");
        }}
      >
        Ativar notificações
      </Button>
    </div>
  );
}
