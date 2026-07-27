import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  Goal,
  UserRoundPen,
  UserKey,
  Drill,
  ChartColumn,
  CalendarDays,
} from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { AppNavLink } from "@/components/app-nav-link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { roleLabels } from "@/lib/domain";
import {
  type AppUser,
  canAccessAdmin,
  canAccessOperations,
  canAccessSales,
} from "@/lib/permissions";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppNavbar({ user }: { user: AppUser }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-375 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="h-auto px-0 hover:bg-transparent"
          >
            <Link
              href="/"
              aria-label="Emilly Office"
              className="inline-flex items-center"
            >
              <Image
                src="/logo.svg"
                alt=""
                width={38}
                height={35}
                priority
                className="h-9 w-auto dark:hidden"
              />
              <Image
                src="/logo-white.svg"
                alt=""
                width={38}
                height={35}
                priority
                className="hidden h-9 w-auto dark:block"
              />
              <span className="inline-flex items-end text-2xl font-black leading-none tracking-normal">
                <span className="text-foreground">Emilly</span>
                <span className="ml-1 rounded-tr-2xl bg-red-600 px-1 py-0.5 pb-0.5 text-primary-foreground">
                  Office.
                </span>
              </span>
            </Link>
          </Button>
          {user.isBootstrapAdmin ? (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
              Primeiro admin
            </span>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {canAccessSales(user.role) ? (
            <>
              <AppNavLink href="/vendas">
                <ClipboardList className="size-5" />
                Vendas
              </AppNavLink>
              <AppNavLink href="/vendas/dashboard">
                <ChartColumn className="size-5" />
                Indicadores
              </AppNavLink>
            </>
          ) : null}
          <AppNavLink href="/calendario">
            <CalendarDays className="size-5" />
            Calendário
          </AppNavLink>
          {canAccessOperations(user.role) ? (
            <AppNavLink href="/montagem">
              <Drill className="size-5" />
              Produção
            </AppNavLink>
          ) : null}
          {canAccessAdmin(user.role) ? (
            <>
              <AppNavLink href="/financeiro">
                <Goal className="size-5" />
                Financeiro
              </AppNavLink>
              <AppNavLink href="/admin/usuarios">
                <UserRoundPen className="size-5" />
                Usuários
              </AppNavLink>
            </>
          ) : null}
        </nav>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex h-9 w-9 rounded-full bg-blue-600 text-md font-semibold text-white">
                {user.name.at(0)?.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 ">
              <DropdownMenuLabel className="text-lg text-center font-semibold py-0">
                {user.name}
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-base text-center text-muted-foreground py-0">
                {roleLabels[user.role]}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-between text-base">
                Alterar Senha
                <UserKey />
              </DropdownMenuItem>
              <DropdownMenuItem className="text-base">
                <LogoutButton className="flex w-full items-center gap-2 justify-between" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function PendingAccess({ user }: { user: AppUser }) {
  if (user.role !== UserRole.PENDING) return null;

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
        <p className="text-base leading-6 text-muted-foreground">
          Sua conta já foi criada. Um administrador precisa liberar seu perfil
          para acessar o sistema.
        </p>
      </section>
    </main>
  );
}
