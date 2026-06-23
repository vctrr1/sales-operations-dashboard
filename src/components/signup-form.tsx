"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "Informe seu nome."),
    email: z.email("Informe um email valido."),
    password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    const data = signupSchema.parse(Object.fromEntries(formData));
    await authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: (ctx) => {
          console.log("Sucesso", ctx);
        },
        onError: (ctx) => {
          console.log("Error", ctx);
        },
      },
    );
  }

  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Insira suas informacoes abaixo e crie sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John"
                required
              />
            </Field>
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
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input id="password" name="password" type="password" required />
              <FieldDescription>
                Precisa ter ao menos 8 caracteres.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar Senha
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
              />
              <FieldDescription>
                Por favor, confirme sua senha.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Cadastrar-se</Button>
                <Button variant="outline" type="button">
                  Criar conta com <FcGoogle />
                </Button>
                <FieldDescription className="px-6 text-center">
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => router.replace("/login")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Logar-se
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
