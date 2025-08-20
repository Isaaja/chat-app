import { Comment } from "../types";
import MessageBubble from "./MessageBubble";

type ChatThreadProps = {
  messages: Comment[];
};

export default function ChatThread({ messages }: ChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-base-100 bg-repeat">
      {messages.map((comment) => (
        <MessageBubble key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
