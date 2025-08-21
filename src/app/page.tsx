"use client";
import { useEffect, useMemo, useState } from "react";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatThread from "@/features/chat/components/ChatThread";
import ChatInput from "@/features/chat/components/ChatInput";
import ChatSidebarSkeleton from "@/features/chat/skeletons/ChatSidebarSkeleton";
import ChatHeaderSkeleton from "@/features/chat/skeletons/ChatHeaderSkeleton";
import ChatThreadSkeleton from "@/features/chat/skeletons/ChatThreadSkeleton";
import type { Result, Comment, ChatComment } from "@/features/chat/types";
import { fetchChatData, fetchParticipants } from "@/services/chat";
import type { Participant } from "@/features/chat/types";

export default function Page() {
  const [chats, setChats] = useState<Result[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Array<Comment | ChatComment>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const [chatRes, participantsRes] = await Promise.all([
          fetchChatData(),
          fetchParticipants(),
        ]);
        const { chats, messages, activeChatId } = chatRes;
        if (cancelled) return;
        setChats(chats);
        setMessages(messages);
        setParticipants(participantsRes);
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

  // Refetch helper (GET API ulang) ketika participant atau group ditambahkan
  async function refetchAll() {
    try {
      setLoading(true);
      const [chatRes, participantsRes] = await Promise.all([
        fetchChatData(),
        fetchParticipants(),
      ]);
      setChats(chatRes.chats);
      setMessages(chatRes.messages);
      setParticipants(participantsRes);
      if (chatRes.activeChatId) setActiveChatId(chatRes.activeChatId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed refreshing data");
    } finally {
      setLoading(false);
    }
  }

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

  // Agent A (me) = participant dengan role = 1
  const myId = useMemo(() => {
    return activeChat?.room.participant.find((p) => p.role === 1)?.id;
  }, [activeChat]);

  function handleSelectChat(chatId: string) {
    setActiveChatId(chatId);
    if (!isDesktop) setShowSidebarMobile(false);
  }

  function handleMessageSentFromChild(message: Comment | ChatComment) {
    if (!activeChatId || !activeChat) return;
    setChats((prevChats) =>
      prevChats.map((chat) =>
        String(chat.room.id) === activeChatId
          ? { ...chat, comments: [...chat.comments, message] }
          : chat
      )
    );
  }

  function handleUpload(file: File) {
    console.log(file);
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
            participants={participants}
            onRefresh={refetchAll}
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
            <ChatThread
              messages={visibleMessages}
              myId={myId}
              isPersonal={
                !!activeChat &&
                ((typeof activeChat.room.name === "string" &&
                  activeChat.room.name.startsWith("Personal:")) ||
                  activeChat.room.participant.filter((p) => p.role !== 1)
                    .length === 1)
              }
            />
          )}
          <ChatInput
            onMessageSent={handleMessageSentFromChild}
            onUpload={handleUpload}
            roomId={activeChat ? Number(activeChat.room.id) : undefined}
          />
        </main>
      )}
    </div>
  );
}
