/* eslint-disable @typescript-eslint/no-unused-vars */
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
      prevChats.map((chat) => {
        if (String(chat.room.id) !== activeChatId) return chat;

        // If message has tempId, replace the pending message
        if ("tempId" in message && message.tempId) {
          const updatedComments = chat.comments.map((comment) => {
            if ("id" in comment && comment.id === message.tempId) {
              return message; // Replace pending with delivered/failed
            }
            return comment;
          });
          return { ...chat, comments: updatedComments };
        }

        // Otherwise, add new message (for pending messages)
        return { ...chat, comments: [...chat.comments, message] };
      })
    );
  }

  function handleUpload(file: File) {
    console.log(file);
  }

  return (
    <div className="w-full h-dvh flex bg-base-100 overflow-hidden ">
      {(isDesktop || showSidebarMobile) &&
        (loading ? (
          <ChatSidebarSkeleton />
        ) : (
          <div className="w-full md:w-1/3 xl:w-1/4">
            <ChatSidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              participants={participants}
              onRefresh={refetchAll}
            />
          </div>
        ))}
      {(isDesktop || !showSidebarMobile) && (
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {loading ? (
            <ChatHeaderSkeleton />
          ) : activeChat ? (
            <ChatHeader
              chat={activeChat}
              onBack={!isDesktop ? () => setShowSidebarMobile(true) : undefined}
            />
          ) : (
            <div className="sm:h-18 p-4 border-b border-base-300 bg-base-200 ">
              <div className="flex items-center gap-3">
                {!isDesktop && (
                  <button
                    onClick={() => setShowSidebarMobile(true)}
                    className="btn btn-ghost btn-sm"
                  >
                    ←
                  </button>
                )}
                <h1 className="text-lg font-semibold text-base-content">
                  Select a Chat
                </h1>
              </div>
            </div>
          )}
          {loading ? (
            <ChatThreadSkeleton />
          ) : error ? (
            <div className="flex-1 grid place-items-center text-error">
              {error}
            </div>
          ) : activeChat ? (
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
          ) : (
            <div className="flex-1 grid place-items-center text-base-content/60 bg-base-100">
              <div className="text-center space-y-4">
                <div className="text-6xl">💬</div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Welcome to Chat App
                  </h2>
                  <p className="text-base-content/70">
                    {chats.length === 0
                      ? "No conversations yet. Create a new chat to get started!"
                      : "Select a conversation from the sidebar to start chatting"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeChat && (
            <div className="flex-shrink-0">
              <ChatInput
                onMessageSent={handleMessageSentFromChild}
                roomId={activeChat ? Number(activeChat.room.id) : undefined}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
