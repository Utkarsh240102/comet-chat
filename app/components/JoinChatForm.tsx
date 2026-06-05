"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  clearChatSession,
  createUidFromName,
  getChatSession,
  saveChatSession,
  type ChatSession,
} from "../cometchat/chatSession";

export function JoinChatForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [savedSession, setSavedSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedSession(getChatSession());
    setHydrated(true);
  }, []);

  const showSavedSession = hydrated && savedSession;

  const joinChat = (displayName: string, uid?: string) => {
    const trimmed = displayName.trim();

    if (trimmed.length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    if (trimmed.length > 50) {
      setError("Please keep your name under 50 characters.");
      return;
    }

    const session = {
      uid: uid ?? createUidFromName(trimmed),
      name: trimmed,
    };

    saveChatSession(session);
    router.push(
      `/chat?uid=${encodeURIComponent(session.uid)}&name=${encodeURIComponent(session.name)}`
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    joinChat(name);
  };

  const handleUseDifferentName = () => {
    clearChatSession();
    setSavedSession(null);
    setName("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {showSavedSession && savedSession && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Welcome back
          </p>
          <p className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {savedSession.name}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => joinChat(savedSession.name, savedSession.uid)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Continue as {savedSession.name}
            </button>
            <button
              type="button"
              onClick={handleUseDifferentName}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Use a different name
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {showSavedSession ? "Or join with a new name" : "Your display name"}
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="e.g. Alex"
            autoComplete="name"
            suppressHydrationWarning
            className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none ring-zinc-900/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-xl bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Join chat
        </button>
      </form>
    </div>
  );
}
