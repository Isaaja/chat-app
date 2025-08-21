import { Comment } from "../types";
import MessageBubble from "./MessageBubble";

type ChatThreadProps = {
  messages: Comment[];
  myId?: string;
  isPersonal: boolean;
};

export default function ChatThread({
  messages,
  myId,
  isPersonal,
}: ChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-base-100">
      {messages.map((comment) => (
        <MessageBubble
          key={comment.id}
          comment={comment}
          myId={myId}
          hideSenderInfo={isPersonal}
        />
      ))}
    </div>
  );
}
