"use client";
import { Result } from "../types";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import NewChatMenu from "./NewChatMenu";
import type { Participant } from "../types";
import { useEffect, useMemo, useState } from "react";
import SearchInput from "../common/SearchInput";
import DefaultAvatar from "../common/DefaultAvatar";

type ChatSidebarProps = {
  chats: Result[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  participants?: Participant[];
  onRefresh?: () => void;
};

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  participants,
  onRefresh,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Combine chats and participants for search
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // If no query, return existing chats only
    if (!q) return { chats, participants: [] };

    // Filter existing chats
    const filteredChats = chats.filter((chat) => {
      // Search by room name
      const roomNameMatch = chat.room.name.toLowerCase().includes(q);

      // Search by participant names in the room
      const participantMatch = chat.room.participant.some(
        (p) =>
          p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      );

      // Search by last message content
      const lastMessage = chat.comments[chat.comments.length - 1];
      const messageMatch =
        lastMessage?.message?.toLowerCase().includes(q) || false;

      return roomNameMatch || participantMatch || messageMatch;
    });

    // Filter all participants from database for personal chat creation
    const filteredParticipants =
      participants?.filter((participant) => {
        const nameMatch = participant.name.toLowerCase().includes(q);
        const idMatch = participant.id.toLowerCase().includes(q);

        // Check if this participant already has a chat room
        const hasExistingChat = chats.some((chat) =>
          chat.room.participant.some((p) => p.id === participant.id)
        );

        return (nameMatch || idMatch) && !hasExistingChat;
      }) || [];

    return { chats: filteredChats, participants: filteredParticipants };
  }, [chats, query, participants]);

  return (
    <div className="bg-base-300 border-r border-black w-full flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center gap-2 justify-between flex-shrink-0">
        <span className="font-bold text-xl">Chats</span>
        <details
          className="dropdown dropdown-end md:dropdown-center"
          open={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
        >
          <summary className="btn btn-ghost rounded-xl p-2">
            <SquarePen className="w-6 h-6" />
          </summary>
          <NewChatMenu
            isOpen={isOpen}
            participants={participants}
            onCreated={onRefresh}
          />
        </details>
      </div>

      {/* Search */}
      <div className="flex-shrink-0">
        <SearchInput query={query} setQuery={setQuery} />
      </div>

      {/* Chat List Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="menu px-1 w-full min-w-0">
          {/* Existing Chats */}
          {filteredResults.chats.map((chat) => {
            const chatId = String(chat.room.id);
            const isActive = chatId === activeChatId;
            const lastMessage = chat.comments[chat.comments.length - 1];

            return (
              <li key={chatId} className="w-full">
                <button
                  className={`flex gap-3 items-center py-3 px-3 rounded-lg w-full hover:bg-base-200 ${
                    isActive ? "bg-base-100" : ""
                  }`}
                  onClick={() => onSelectChat(chatId)}
                >
                  {/* Avatar */}
                  <div className="avatar avatar-offline flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-black">
                      {chat.room.image_url ? (
                        <Image
                          src={chat.room.image_url}
                          alt={chat.room.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar name={chat.room.name} />
                      )}
                    </div>
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium truncate flex-1">
                        {chat.room.name}
                      </span>
                      <span className="text-xs opacity-60 whitespace-nowrap flex-shrink-0">
                        {lastMessage?.timestamp
                          ? new Date(lastMessage.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}
                      </span>
                    </div>
                    <div className="text-sm opacity-70 flex items-center gap-2 w-full">
                      <span className="truncate flex-1 min-w-0">
                        {lastMessage?.message ?? ""}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}

          {/* Available Participants */}
          {query && filteredResults.participants.length > 0 && (
            <>
              {filteredResults.participants.map((participant) => (
                <li key={`new-${participant.id}`} className="w-full">
                  <button
                    className="flex gap-3 items-center py-3 px-3 rounded-lg w-full hover:bg-base-200"
                    onClick={() => {
                      console.log("Start personal chat with:", participant);
                    }}
                  >
                    <div className="avatar avatar-offline flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black">
                        <DefaultAvatar name={participant.name} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium truncate flex-1">
                          {participant.name}
                        </span>
                        <span className="text-xs opacity-60 whitespace-nowrap flex-shrink-0">
                          New
                        </span>
                      </div>
                      <div className="text-sm opacity-70">
                        Start a conversation
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
