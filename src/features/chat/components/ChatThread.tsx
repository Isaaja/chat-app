import { Comment, ChatComment } from "../types";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

type ChatThreadProps = {
  messages: Array<Comment | ChatComment>;
  myId?: string;
  isPersonal: boolean;
};

export default function ChatThread({
  messages,
  myId,
  isPersonal,
}: ChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div ref={messagesEndRef} />
    </div>
  );
}
