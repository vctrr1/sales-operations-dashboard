"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await authClient.signOut();
          toast.success("Sessão encerrada.");
          router.replace("/login");
        } catch {
          toast.error("Não foi possível sair da conta.");
        }
      }}
    >
      Sair
      <LogOut className="size-4" />
    </button>
  );
}
