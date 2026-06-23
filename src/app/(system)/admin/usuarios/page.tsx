import { Save } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { roleLabels, roleOptions } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { updateUserRole } from "../../actions";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

export default async function UsersPage() {
  await requireRole([UserRole.ADMIN]);

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="grid gap-5">
      <section>
        <h1 className="text-xl font-semibold">Usuários</h1>
        <p className="text-sm text-muted-foreground">Perfis de acesso</p>
      </section>

      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Perfil</th>
                <th className="py-2 pr-3">Criado em</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-medium">{user.name}</td>
                  <td className="py-3 pr-3">{user.email}</td>
                  <td className="py-3 pr-3">
                    <form id={`role-${user.id}`} action={updateUserRole}>
                      <input type="hidden" name="userId" value={user.id} />
                      <select name="role" defaultValue={user.role} className={selectClass}>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="py-3 pr-3">
                    {new Intl.DateTimeFormat("pt-BR").format(user.createdAt)}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <Button form={`role-${user.id}`} type="submit" size="sm">
                      <Save />
                      Salvar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
