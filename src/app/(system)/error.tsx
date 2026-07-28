"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SystemError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-2xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            Não foi possível carregar os dados agora.
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-base text-muted-foreground">
            O sistema encontrou uma instabilidade ao consultar as informações.
            Tente novamente em alguns instantes.
          </p>
          <Button type="button" className="w-fit text-base" onClick={reset}>
            <RotateCcw />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
