"use client";
import { useEffect, useRef, useState } from "react";
import { Chat } from "../types";
import Image from "next/image";
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
  const [sidebarWidth, setSidebarWidth] = useState<number>(384);
  const dragStartXRef = useRef<number | null>(null);
  const startWidthRef = useRef<number>(sidebarWidth);

  useEffect(() => {
    const persisted =
      typeof window !== "undefined"
        ? window.localStorage.getItem("chat.sidebarWidth")
        : null;
    if (persisted) {
      const n = Number(persisted);
      if (!Number.isNaN(n)) setSidebarWidth(n);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("chat.sidebarWidth", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  function onDragStart(e: React.MouseEvent) {
    dragStartXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    window.addEventListener("mousemove", onDragging);
    window.addEventListener("mouseup", onDragEnd);
  }

  function onDragging(e: MouseEvent) {
    if (dragStartXRef.current == null) return;
    const delta = e.clientX - dragStartXRef.current;
    const next = Math.min(560, Math.max(260, startWidthRef.current + delta));
    setSidebarWidth(next);
  }

  function onDragEnd() {
    dragStartXRef.current = null;
    window.removeEventListener("mousemove", onDragging);
    window.removeEventListener("mouseup", onDragEnd);
  }
  return (
    <div
      className="bg-base-200 border-r border-black max-w-full flex flex-col relative"
      style={{ width: sidebarWidth }}
    >
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
                    <Image
                      src={chat.avatarUrl ?? ""}
                      alt={chat.name}
                      width={40}
                      height={40}
                    />
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
                  <div className="text-sm opacity-70 flex items-center gap-2">
                    <span className="truncate min-w-0 flex-1 line-clamp-1">
                      {chat.lastMessage}
                    </span>
                    {chat.unreadCount ? (
                      <div className="badge badge-primary badge-sm flex-shrink-0">
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
      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:w-2 hover:bg-base-300 transition-all"
        aria-label="Resize sidebar"
        title="Resize"
        role="separator"
        aria-orientation="vertical"
      />
    </div>
  );
}
