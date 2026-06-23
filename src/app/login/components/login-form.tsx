"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const loginSchema = z.object({
  email: z.email("Informe um email valido."),
  password: z.string().min(6, "Informe sua senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    const data = loginSchema.parse(Object.fromEntries(formData));

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
        rememberMe: false,
      },
      {
        onSuccess: (ctx) => {
          console.log("Sucesso", ctx);
          router.replace("/app");
        },
        onError: (ctx) => {
          console.log("Error", ctx);
        },
      },
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <Button variant="outline" type="button">
                  Login com
                  <FcGoogle />
                </Button>

                <FieldDescription className="px-6 text-center">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => router.replace("/signup")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Cadastrar-se
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
