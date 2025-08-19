import { Result } from "../types";
import Image from "next/image";
type ChatHeaderProps = {
  chat?: Result;
  onBack?: () => void;
};

export default function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-base-300 flex items-center gap-3 px-4">
      {onBack ? (
        <button
          className="btn btn-ghost btn-sm lg:hidden"
          onClick={onBack}
          aria-label="Back"
        >
          ←
        </button>
      ) : null}
      <div className="avatar">
        <div className="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
          {chat?.room?.image_url ? (
            <Image
              src={chat.room.image_url}
              alt={chat.room.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-white font-bold">
              {chat?.room?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{chat?.room.name ?? "Pilih chat"}</span>
        <span className="text-xs opacity-70">{chat ? "online" : ""}</span>
      </div>
    </div>
  );
}
