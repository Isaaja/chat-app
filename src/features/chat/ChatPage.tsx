"use client";
import { useEffect, useMemo, useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatThread from "./components/ChatThread";
import ChatInput from "./components/ChatInput";
import { mockChats, mockMessages } from "./data/mock";
import type { Chat, Message } from "./types";
import loadDummyData from "@/app/api/chat";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    mockChats[0]?.id
  );
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const { chats, messages, activeChatId } = await loadDummyData();
        if (cancelled) return;
        setChats(chats);
        setMessages(messages);
        if (activeChatId) setActiveChatId(activeChatId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed fetching dummy data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId),
    [chats, activeChatId]
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
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <ChatHeader chat={activeChat} />
        {loading ? (
          <div className="flex-1 grid place-items-center">Loading…</div>
        ) : error ? (
          <div className="flex-1 grid place-items-center text-error">
            {error}
          </div>
        ) : (
          <ChatThread messages={visibleMessages} />
        )}
        <ChatInput onSend={handleSend} />
      </main>
    </div>
  );
}
