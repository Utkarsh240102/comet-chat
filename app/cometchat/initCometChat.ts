import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import { formatCometChatError } from "./formatCometChatError";

const COMETCHAT_CONSTANTS = {
  APP_ID: process.env.NEXT_PUBLIC_COMETCHAT_APP_ID!,
  REGION: process.env.NEXT_PUBLIC_COMETCHAT_REGION!,
  AUTH_KEY: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY!,
};

let initPromise: Promise<void> | null = null;
let authChain: Promise<unknown> = Promise.resolve();
let activeLogin:
  | { key: string; promise: Promise<CometChat.User> }
  | null = null;

function buildSettings() {
  return new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();
}

function runWithAuthLock<T>(operation: () => Promise<T>): Promise<T> {
  const next = authChain.then(operation, operation);
  authChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function ensureCometChatInitialized(): Promise<void> {
  if (CometChatUIKit.isInitialized?.()) {
    return Promise.resolve();
  }

  if (!initPromise) {
    const settings = buildSettings();
    const result = CometChatUIKit.init(settings);

    initPromise = (result ?? Promise.resolve({}))
      .then(() => undefined)
      .catch((error: unknown) => {
        initPromise = null;
        throw new Error(formatCometChatError(error));
      });
  }

  return initPromise;
}

async function ensureUserExists(uid: string, name: string): Promise<void> {
  const user = new CometChat.User(uid);
  user.setName(name);

  try {
    await CometChat.createUser(user, COMETCHAT_CONSTANTS.AUTH_KEY);
    return;
  } catch (createError: unknown) {
    const message = formatCometChatError(createError).toLowerCase();

    if (!message.includes("already") && !message.includes("exist")) {
      throw createError;
    }
  }

  try {
    await CometChat.updateUser(user, COMETCHAT_CONSTANTS.AUTH_KEY);
  } catch {
    // User exists but name update failed — still allow login.
  }
}

async function safeLogout(): Promise<void> {
  try {
    const loggedInUser = await CometChatUIKit.getLoggedinUser();
    if (loggedInUser) {
      await CometChatUIKit.logout();
    }
  } catch {
    // Logout can fail if the session was already cleared.
  }
}

async function performLogin(uid: string, name: string): Promise<CometChat.User> {
  await ensureCometChatInitialized();
  await ensureUserExists(uid, name);

  const loggedInUser = await CometChatUIKit.getLoggedinUser();

  if (loggedInUser?.getUid() === uid) {
    if (loggedInUser.getName() !== name) {
      const updatedUser = new CometChat.User(uid);
      updatedUser.setName(name);
      try {
        await CometChat.updateUser(updatedUser, COMETCHAT_CONSTANTS.AUTH_KEY);
        loggedInUser.setName(name);
      } catch {
        // Keep the session even if the display name could not be updated.
      }
    }
    return loggedInUser;
  }

  await safeLogout();
  return CometChatUIKit.login(uid);
}

export function loginChatUser(
  uid: string,
  name: string
): Promise<CometChat.User> {
  const key = `${uid}:${name}`;

  if (activeLogin?.key === key) {
    return activeLogin.promise;
  }

  const promise = runWithAuthLock(() => performLogin(uid, name)).finally(() => {
    if (activeLogin?.promise === promise) {
      activeLogin = null;
    }
  });

  activeLogin = { key, promise };
  return promise;
}
