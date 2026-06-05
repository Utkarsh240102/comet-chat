"use client";

import { useCallback, useState } from "react";
import { deferUpdate } from "./deferUpdate";
import type { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  CometChatConversations,
  CometChatUsers,
} from "@cometchat/chat-uikit-react";

interface SelectorProps {
  onSelectorItemClicked?: (
    input: CometChat.Conversation | CometChat.User | CometChat.Group,
    type: string
  ) => void;
}

export const CometChatSelector = ({
  onSelectorItemClicked = () => {},
}: SelectorProps) => {
  const [activeConversation, setActiveConversation] = useState<
    CometChat.Conversation | undefined
  >();
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");

  const handleConversationClick = useCallback(
    (conversation: CometChat.Conversation) => {
      deferUpdate(() => {
        setActiveConversation(conversation);
        onSelectorItemClicked(conversation, "updateSelectedItem");
      });
    },
    [onSelectorItemClicked]
  );

  const handleUserClick = useCallback(
    (user: CometChat.User) => {
      deferUpdate(() => {
        setActiveConversation(undefined);
        onSelectorItemClicked(user, "user");
      });
    },
    [onSelectorItemClicked]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="selector-tabs">
        <button
          type="button"
          className={`selector-tab ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          type="button"
          className={`selector-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>
      <div className="selector-panel">
        {activeTab === "chats" && (
          <CometChatConversations
            activeConversation={activeConversation}
            onItemClick={handleConversationClick}
          />
        )}
        {activeTab === "users" && (
          <CometChatUsers onItemClick={handleUserClick} />
        )}
      </div>
    </div>
  );
};
