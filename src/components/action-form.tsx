"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field";
import type { ActionResult } from "@/lib/action-result";

type ActionFormContextValue = {
  fieldErrors: Record<string, string>;
  message: string | null;
  isPending: boolean;
};

const ActionFormContext = createContext<ActionFormContextValue | null>(null);

function useActionFormContext() {
  const context = useContext(ActionFormContext);

  if (!context) {
    throw new Error("Action form components must be used inside ActionForm.");
  }

  return context;
}

export function ActionForm({
  action,
  children,
  className,
  id,
  resetOnSuccess = false,
  successToast = true,
  errorToast = true,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  id?: string;
  resetOnSuccess?: boolean;
  successToast?: boolean;
  errorToast?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetVersion, setResetVersion] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let result: ActionResult;

      try {
        result = await action(formData);
      } catch (error) {
        console.error(error);
        result = {
          ok: false,
          message: "Não foi possível concluir a ação. Tente novamente.",
        };
      }

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});

        if (errorToast && !result.fieldErrors) {
          toast.error(result.message);
        }

        return;
      }

      setMessage(null);
      setFieldErrors({});

      if (successToast && result.message) {
        toast.success(result.message);
      }

      if (resetOnSuccess) {
        form.reset();
        setResetVersion((version) => version + 1);
      }

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }

      router.refresh();
    });
  }

  return (
    <ActionFormContext
      value={{
        fieldErrors,
        message,
        isPending,
      }}
    >
      <form
        id={id}
        key={resetVersion}
        className={className}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </ActionFormContext>
  );
}

export function ActionFormError({ className }: { className?: string }) {
  const { message, fieldErrors } = useActionFormContext();

  if (!message || Object.keys(fieldErrors).length > 0) return null;

  return <FieldError className={className}>{message}</FieldError>;
}

export function ActionFieldError({ name }: { name: string }) {
  const { fieldErrors } = useActionFormContext();

  return <FieldError>{fieldErrors[name]}</FieldError>;
}
