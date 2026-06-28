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
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.signIn.email(
        {
          email: parsed.data.email,
          password: parsed.data.password,
          callbackURL: "/",
          rememberMe: false,
        },
        {
          onSuccess: () => {
            toast.success("Login realizado com sucesso.");
            router.replace("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Não foi possível fazer login.");
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha:</FieldLabel>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="text-base md:text-base"
                  required
                />
              </Field>
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
                      "Login"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="text-base"
                    disabled
                  >
                    Login
                    <FcGoogle />
                  </Button>
                </div>

                <FieldDescription className="pt-3 text-center">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => router.replace("/signup")}
                    className="text-blue-400 hover:text-blue-500 cursor-pointer"
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
