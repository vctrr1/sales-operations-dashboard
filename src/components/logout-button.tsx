"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.replace("/login");
      }}
    >
      Sair
      <LogOut className="size-4" />
    </button>
  );
}
