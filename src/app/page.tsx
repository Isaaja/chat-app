"use client";
import { useEffect, useMemo, useState } from "react";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatThread from "@/features/chat/components/ChatThread";
import ChatInput from "@/features/chat/components/ChatInput";
import ChatSidebarSkeleton from "@/features/chat/skeletons/ChatSidebarSkeleton";
import ChatHeaderSkeleton from "@/features/chat/skeletons/ChatHeaderSkeleton";
import ChatThreadSkeleton from "@/features/chat/skeletons/ChatThreadSkeleton";
import type { Result, Comment } from "@/features/chat/types";
import { fetchChatData } from "@/services/chat";

export default function Page() {
  const [chats, setChats] = useState<Result[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const { chats, messages, activeChatId } = await fetchChatData();
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

  useEffect(() => {
    const update = () => {
      const desktop =
        typeof window !== "undefined" ? window.innerWidth >= 768 : false;
      setIsDesktop(desktop);
      if (desktop) setShowSidebarMobile(true);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const activeChat = useMemo(
    () => chats.find((c) => String(c.room.id) === activeChatId),
    [chats, activeChatId]
  );

  const visibleMessages = useMemo(() => {
    if (!activeChat) return [];
    return activeChat.comments;
  }, [activeChat]);

  function handleSelectChat(chatId: string) {
    setActiveChatId(chatId);
    if (!isDesktop) setShowSidebarMobile(false);
  }

  function handleSend(text: string) {
    if (!activeChatId || !activeChat) return;
    const newMessage: Comment = {
      id: crypto.randomUUID(),
      type: "text",
      message: text,
      sender: {
        id: "me",
        name: "Me",
        avatar: undefined,
      },
      timestamp: new Date().toISOString(),
    };

    // Update the active chat's comments
    setChats((prevChats) =>
      prevChats.map((chat) =>
        String(chat.room.id) === activeChatId
          ? { ...chat, comments: [...chat.comments, newMessage] }
          : chat
      )
    );
  }

  return (
    <div className="w-full h-dvh flex bg-base">
      {(isDesktop || showSidebarMobile) &&
        (loading ? (
          <ChatSidebarSkeleton />
        ) : (
          <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
          />
        ))}
      {(isDesktop || !showSidebarMobile) && (
        <main className="flex-1 flex flex-col">
          {loading ? (
            <ChatHeaderSkeleton />
          ) : (
            <ChatHeader
              chat={activeChat}
              onBack={!isDesktop ? () => setShowSidebarMobile(true) : undefined}
            />
          )}
          {loading ? (
            <ChatThreadSkeleton />
          ) : error ? (
            <div className="flex-1 grid place-items-center text-error">
              {error}
            </div>
          ) : (
            <ChatThread messages={visibleMessages} />
          )}
          <ChatInput onSend={handleSend} />
        </main>
      )}
    </div>
  );
}
