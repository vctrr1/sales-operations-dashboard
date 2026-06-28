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
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.signUp.email(
        {
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Conta criada com sucesso.");
            router.replace("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Não foi possível criar a conta.");
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription className="text-base">
          Insira suas informacoes abaixo e crie sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome:</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John"
                className="text-base md:text-base"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email:</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className="text-base md:text-base"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha:</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                className="text-base md:text-base"
                required
              />
              <FieldDescription className="text-center">
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
              <FieldDescription className="text-center">
                Por favor, confirme sua senha.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="text-base bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="animate-spin size-5" />
                    ) : (
                      "Cadastrar-se"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="text-base"
                    disabled
                  >
                    Criar conta com <FcGoogle />
                  </Button>
                </div>
                <FieldDescription className="pt-3 text-center">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => router.replace("/login")}
                    className="text-blue-400 hover:text-blue-500 cursor-pointer "
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
