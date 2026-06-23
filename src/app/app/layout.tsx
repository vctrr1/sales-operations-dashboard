import Link from "next/link";
import { ClipboardList, Goal, LayoutDashboard, Shield, Truck } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/domain";
import {
  canAccessAdmin,
  canAccessOperations,
  canAccessSales,
  requireUser,
} from "@/lib/permissions";

const navItemClass =
  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  if (user.role === UserRole.PENDING) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <section className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Acesso pendente</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <LogoutButton />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Sua conta já foi criada. Um administrador precisa liberar seu perfil para
            acessar o sistema.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="px-0 text-base font-semibold">
              <Link href="/app">Chairs Store</Link>
            </Button>
            <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
              {roleLabels[user.role]}
            </span>
            {user.isBootstrapAdmin ? (
              <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                Primeiro admin
              </span>
            ) : null}
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {canAccessSales(user.role) ? (
              <>
                <Link className={navItemClass} href="/app/vendas">
                  <ClipboardList className="size-4" />
                  Vendas
                </Link>
                <Link className={navItemClass} href="/app/vendas/dashboard">
                  <LayoutDashboard className="size-4" />
                  Indicadores
                </Link>
              </>
            ) : null}
            {canAccessOperations(user.role) ? (
              <Link className={navItemClass} href="/app/montagem">
                <Truck className="size-4" />
                Montagem
              </Link>
            ) : null}
            {canAccessAdmin(user.role) ? (
              <>
                <Link className={navItemClass} href="/app/financeiro">
                  <Goal className="size-4" />
                  Financeiro
                </Link>
                <Link className={navItemClass} href="/app/admin/usuarios">
                  <Shield className="size-4" />
                  Usuários
                </Link>
              </>
            ) : null}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
