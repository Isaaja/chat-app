import { Comment } from "../types";
import DefaultAvatar from "../common/DefaultAvatar";

type MessageBubbleProps = {
  comment: Comment;
};

export default function MessageBubble({ comment }: MessageBubbleProps) {
  const isMine = comment.sender.id === "me" || comment.sender.name === "Me";
  const position = isMine ? "chat-end" : "chat-start";

  return (
    <div className={`chat ${position}`}>
      {!isMine && (
        <div className="chat-image">
          <DefaultAvatar name={comment.sender.name} />
        </div>
      )}

      {!isMine && (
        <div className="chat-header">
          <span className="text-xs opacity-70">{comment.sender.name}</span>
        </div>
      )}

      <div
        className={`chat-bubble ${
          isMine ? "bg-primary text-primary-content" : ""
        }`}
      >
        {comment.message}
      </div>

      {comment.timestamp ? (
        <div className="chat-footer text-[10px] opacity-70">
          {new Date(comment.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ) : null}
    </div>
  );
}
