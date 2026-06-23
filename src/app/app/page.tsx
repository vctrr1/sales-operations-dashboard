import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/permissions";

export default async function AppHome() {
  const user = await requireUser();

  if (user.role === UserRole.ADMIN) redirect("/app/vendas/dashboard");
  if (user.role === UserRole.SALES) redirect("/app/vendas");
  if (user.role === UserRole.OPERATION) redirect("/app/montagem");

  return null;
}
