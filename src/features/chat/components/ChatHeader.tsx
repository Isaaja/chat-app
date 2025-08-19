import { Chat } from "../types";

type ChatHeaderProps = {
  chat?: Chat;
};

export default function ChatHeader({ chat }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-base-300 flex items-center gap-3 px-4">
      <div className="avatar">
        <div className="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
          <span className="text-lg">
            {chat
              ? chat.avatarLetter ?? chat.name.charAt(0).toUpperCase()
              : "?"}
          </span>
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
