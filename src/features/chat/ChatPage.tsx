"use client";
import { useMemo, useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatThread from "./components/ChatThread";
import ChatInput from "./components/ChatInput";
import { mockChats, mockMessages } from "./data/mock";
import { Message } from "./types";

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    mockChats[0]?.id
  );
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const activeChat = useMemo(
    () => mockChats.find((c) => c.id === activeChatId),
    [activeChatId]
  );
  const visibleMessages = useMemo(
    () => messages.filter((m) => m.chatId === activeChatId),
    [messages, activeChatId]
  );

  function handleSend(text: string) {
    if (!activeChatId) return;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      chatId: activeChatId,
      author: "me",
      text,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);
  }

  return (
    <div className="w-full h-dvh flex bg-base">
      <ChatSidebar
        chats={mockChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <ChatHeader chat={activeChat} />
        <ChatThread messages={visibleMessages} />
        <ChatInput onSend={handleSend} />
      </main>
    </div>
  );
}
