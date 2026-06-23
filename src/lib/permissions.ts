import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole, type UserRole as UserRoleType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isBootstrapAdmin: boolean;
};

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return null;

  const [user, adminCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
  ]);

  if (!user) return null;

  return {
    ...user,
    role: adminCount === 0 ? UserRole.ADMIN : user.role,
    isBootstrapAdmin: adminCount === 0,
  } satisfies AppUser;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: UserRoleType[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/app");
  return user;
}

export function canAccessSales(role: UserRoleType) {
  return role === UserRole.SALES || role === UserRole.ADMIN;
}

export function canAccessOperations(role: UserRoleType) {
  return role === UserRole.OPERATION || role === UserRole.ADMIN;
}

export function canAccessAdmin(role: UserRoleType) {
  return role === UserRole.ADMIN;
}
