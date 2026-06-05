"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CometChatMessageComposer,
  CometChatMessageHeader,
  CometChatMessageList,
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatSelector } from "./CometChatSelector";
import { deferUpdate } from "./deferUpdate";
import { formatCometChatError } from "./formatCometChatError";
import { loginChatUser } from "./initCometChat";
import "./CometChatNoSSR.css";

interface CometChatNoSSRProps {
  uid: string;
  name: string;
}

const CometChatNoSSR: React.FC<CometChatNoSSRProps> = ({ uid, name }) => {
  const [user, setUser] = useState<CometChat.User | undefined>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<CometChat.User | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<
    CometChat.Group | undefined
  >();

  const handleSelection = useCallback(
    (
      activeItem: CometChat.Conversation | CometChat.User | CometChat.Group
    ) => {
      deferUpdate(() => {
        const item =
          activeItem instanceof CometChat.Conversation
            ? activeItem.getConversationWith()
            : activeItem;

        if (item instanceof CometChat.User) {
          setSelectedUser(item);
          setSelectedGroup(undefined);
        } else if (item instanceof CometChat.Group) {
          setSelectedUser(undefined);
          setSelectedGroup(item);
        }
      });
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      setStatus("loading");
      setError(null);

      try {
        const loggedInUser = await loginChatUser(uid, name);
        if (!cancelled) {
          setUser(loggedInUser);
          setStatus("ready");
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(formatCometChatError(e));
          setStatus("error");
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
    };
  }, [uid, name]);

  if (status === "loading") {
    return (
      <div className="chat-loading">
        <div className="chat-loading-spinner" aria-hidden />
        <p>Connecting to chat...</p>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="chat-error">
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="conversations-with-messages">
      <div className="conversations-wrapper">
        <CometChatSelector onSelectorItemClicked={handleSelection} />
      </div>
      {selectedUser || selectedGroup ? (
        <div className="messages-wrapper">
          {selectedUser && (
            <CometChatMessageHeader
              key={`header-${selectedUser.getUid()}`}
              user={selectedUser}
            />
          )}
          {selectedGroup && (
            <CometChatMessageHeader
              key={`header-${selectedGroup.getGuid()}`}
              group={selectedGroup}
            />
          )}
          {selectedUser && (
            <CometChatMessageList
              key={`messages-${selectedUser.getUid()}`}
              user={selectedUser}
            />
          )}
          {selectedGroup && (
            <CometChatMessageList
              key={`messages-${selectedGroup.getGuid()}`}
              group={selectedGroup}
            />
          )}
          {selectedUser && (
            <CometChatMessageComposer
              key={`composer-${selectedUser.getUid()}`}
              user={selectedUser}
            />
          )}
          {selectedGroup && (
            <CometChatMessageComposer
              key={`composer-${selectedGroup.getGuid()}`}
              group={selectedGroup}
            />
          )}
        </div>
      ) : (
        <div className="empty-conversation">
          Select a user from the Users tab to start chatting
        </div>
      )}
    </div>
  );
};

export default CometChatNoSSR;
