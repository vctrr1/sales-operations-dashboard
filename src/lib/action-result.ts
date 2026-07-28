export type ActionResult =
  | {
      ok: true;
      message?: string;
      redirectTo?: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export class ActionError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ActionError";
    this.fieldErrors = fieldErrors;
  }
}

function getErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

export function formatActionError(error: unknown) {
  if (error instanceof ActionError) {
    return {
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  const code = getErrorCode(error);

  if (code === "P1001") {
    return { message: "Não foi possível conectar ao banco de dados agora." };
  }

  if (code === "P1002" || code === "P2024") {
    return { message: "O banco demorou para responder. Tente novamente." };
  }

  if (code === "P2037") {
    return {
      message:
        "O banco atingiu o limite de conexões. Tente novamente em instantes.",
    };
  }

  if (code === "P2025") {
    return { message: "Registro não encontrado ou já removido." };
  }

  if (code === "P2002") {
    return { message: "Já existe um registro com essas informações." };
  }

  console.error(error);
  return { message: "Não foi possível concluir a ação. Tente novamente." };
}

export async function safeAction(
  callback: () => Promise<ActionResult>,
): Promise<ActionResult> {
  try {
    return await callback();
  } catch (error) {
    const formatted = formatActionError(error);

    return {
      ok: false,
      message: formatted.message,
      fieldErrors: formatted.fieldErrors,
    };
  }
}
