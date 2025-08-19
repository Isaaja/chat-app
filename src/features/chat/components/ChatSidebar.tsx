"use client";
import { Chat } from "../types";

type ChatSidebarProps = {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
};

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <div className="bg-base-200 border-r border-base-300 w-full lg:w-96 max-w-full flex flex-col">
      <div className="p-4 border-b border-base-300 flex items-center gap-2">
        <span className="font-bold text-xl">Chats</span>
        <div className="ml-auto" />
      </div>
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
      <ul className="menu px-1 overflow-y-auto w-full">
        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <li key={chat.id}>
              <button
                className={`flex gap-3 items-center py-3 px-3 rounded-lg ${
                  isActive ? "bg-base-300" : "hover:bg-base-300/60"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="avatar avatar-offline">
                  <div className="w-10 rounded-full">
                    <img src={chat.avatarUrl} />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left ">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate bg-red">
                      {chat.name}
                    </span>
                    <span className="ml-auto text-xs opacity-60 whitespace-nowrap">
                      {new Date(chat.lastTimestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm opacity-70 truncate flex justify-between">
                    {chat.lastMessage}
                    {chat.unreadCount ? (
                      <div className="badge badge-primary badge-sm">
                        {chat.unreadCount}
                      </div>
                    ) : null}
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
