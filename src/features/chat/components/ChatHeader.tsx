import { Chat } from "../types";
import Image from "next/image";
type ChatHeaderProps = {
  chat?: Chat;
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
          <Image
            src={chat?.avatarUrl ?? ""}
            alt={chat?.name ?? ""}
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{chat?.name ?? "Pilih chat"}</span>
        <span className="text-xs opacity-70">{chat ? "online" : ""}</span>
      </div>
      <div className="ml-auto flex gap-2">
        <button className="btn btn-ghost btn-sm">Search</button>
        <button className="btn btn-ghost btn-sm">More</button>
      </div>
    </div>
  );
}
