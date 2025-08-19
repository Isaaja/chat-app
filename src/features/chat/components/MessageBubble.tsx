import { Comment } from "../types";

type MessageBubbleProps = {
  comment: Comment;
};

export default function MessageBubble({ comment }: MessageBubbleProps) {
  const isMine = comment.sender.name === "agent@mail.com";
  return (
    <div className={`w-full flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
          isMine ? "bg-primary text-primary-content" : "bg-base-200"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{comment.message}</div>
        <div className={`text-[10px] opacity-70 mt-1 text-right`}>
          {new Date(comment.timestamp ?? "").toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
