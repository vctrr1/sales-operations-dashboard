import { Save } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleLabels, roleOptions } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { updateUserRole } from "../../actions";

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
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl">Usuários</h1>
          <p className="text-base text-muted-foreground">Perfis de Acesso</p>
        </div>
      </section>
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-base">
            <thead className="border-b text-sm uppercase text-muted-foreground">
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
                      <Select name="role" defaultValue={user.role}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </form>
                  </td>
                  <td className="py-3 pr-3">
                    {new Intl.DateTimeFormat("pt-BR").format(user.createdAt)}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <Button
                      type="submit"
                      form={`role-${user.id}`}
                      className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
                    >
                      <Save />
                      Salvar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
