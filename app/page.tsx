import { JoinChatForm } from "./components/JoinChatForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Chat demo
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Enter your name to join. Open another browser window with a different
          name, then use the Users tab to message each other.
        </p>

        <div className="mt-8">
          <JoinChatForm />
        </div>
      </main>
    </div>
  );
}
