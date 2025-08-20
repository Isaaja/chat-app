"use client";
import { Result } from "../types";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import NewChatMenu from "./NewChatMenu";
import type { Participant } from "../types";
import { useState } from "react";

type ChatSidebarProps = {
  chats: Result[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  participants?: Participant[];
};

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  participants,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-base-300 border-r border-black w-full md:w-1/3 xl:w-1/4 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center gap-2 justify-between">
        <span className="font-bold text-xl">Chats</span>
        <details
          className="dropdown dropdown-end md:dropdown-center"
          open={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
        >
          <summary className="btn btn-ghost rounded-xl p-2">
            <SquarePen className="w-6 h-6" />
          </summary>
          <NewChatMenu isOpen={isOpen} participants={participants} />
        </details>
      </div>

      {/* Search */}
      <div className="p-3">
        <label className="input items-center w-full">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" placeholder="Search" className="grow" />
        </label>
      </div>

      {/* Chat List */}
      <ul className="menu px-1 overflow-y-auto flex-1 w-full">
        {chats.map((chat) => {
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
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {chat.room.image_url ? (
                      <Image
                        src={chat.room.image_url}
                        alt={chat.room.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-neutral text-neutral-content w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(chat.room.name?.charAt(0) ?? "?").toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  {/* Name + Time */}
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium truncate flex-1">
                      {chat.room.name}
                    </span>
                    <span className="text-xs opacity-60 whitespace-nowrap flex-shrink-0">
                      {lastMessage?.timestamp
                        ? new Date(lastMessage.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </span>
                  </div>

                  {/* Last Message + Unread */}
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
      </ul>
    </div>
  );
}
