import { startTransition } from "react";

/** Defer state updates out of third-party render paths (e.g. CometChat UI Kit). */
export function deferUpdate(update: () => void): void {
  queueMicrotask(() => {
    startTransition(update);
  });
}
