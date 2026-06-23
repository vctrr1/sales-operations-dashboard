import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/permissions";

export default async function Home() {
  const user = await requireUser();

  if (user.role === UserRole.ADMIN) redirect("/vendas/dashboard");
  if (user.role === UserRole.SALES) redirect("/vendas");
  if (user.role === UserRole.OPERATION) redirect("/montagem");

  redirect("/vendas");
}
