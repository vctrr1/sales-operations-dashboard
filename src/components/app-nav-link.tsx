"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItemClass =
  "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-lg font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground";

export function AppNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      className={cn(
        navItemClass,
        isActive && "text-primary hover:text-primary",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
