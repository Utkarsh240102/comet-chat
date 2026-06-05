export type ChatSession = {
  uid: string;
  name: string;
};

const STORAGE_KEY = "cometchat-session";

export function saveChatSession(session: ChatSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getChatSession(): ChatSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatSession;
    if (parsed.uid && parsed.name) return parsed;
  } catch {
    return null;
  }

  return null;
}

export function clearChatSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function createUidFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug || "user"}-${suffix}`;
}

export function isValidUid(uid: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(uid);
}
