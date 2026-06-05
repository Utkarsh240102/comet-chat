export function formatCometChatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }

    const maybeCode = (error as { code?: unknown }).code;
    if (typeof maybeCode === "string" && maybeCode.length > 0) {
      return maybeCode;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Something went wrong while connecting to chat.";
    }
  }

  return "Something went wrong while connecting to chat.";
}
