"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidUid, saveChatSession } from "../cometchat/chatSession";

const CometChatComponent = dynamic(
  () => import("../cometchat/CometChatNoSSR"),
  {
    ssr: false,
    loading: () => (
      <div className="chat-loading">
        <div className="chat-loading-spinner" aria-hidden />
        <p>Loading chat...</p>
      </div>
    ),
  }
);

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const name = searchParams.get("name");

  useEffect(() => {
    if (uid && name && isValidUid(uid)) {
      saveChatSession({ uid, name });
    }
  }, [uid, name]);

  if (!uid || !name || !isValidUid(uid)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-zinc-600">
          Enter your name on the home page to join chat.
        </p>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
        >
          Go to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Switch user
        </button>
        <span className="text-sm text-zinc-500">Signed in as {name}</span>
      </header>
      <div className="min-h-0 flex-1">
        <CometChatComponent key={uid} uid={uid} name={name} />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="chat-loading">
          <div className="chat-loading-spinner" aria-hidden />
          <p>Loading chat...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
