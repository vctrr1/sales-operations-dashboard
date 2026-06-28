import { UserRole } from "@/generated/prisma/enums";
import { AppNavbar, PendingAccess } from "@/components/app-navbar";
import { requireUser } from "@/lib/permissions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (user.role === UserRole.PENDING) {
    return <PendingAccess user={user} />;
  }

  return (
    <div className="min-h-svh">
      <AppNavbar user={user} />
      <main className="mx-auto max-w-375 px-4 py-6 ">{children}</main>
    </div>
  );
}
