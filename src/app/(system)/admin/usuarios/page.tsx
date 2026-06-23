import { Save } from "lucide-react";
import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Perfis de acesso</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
                    <Button form={`role-${user.id}`} type="submit" size="sm">
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
