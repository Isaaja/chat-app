import { Message } from "../types";
import MessageBubble from "./MessageBubble";

type ChatThreadProps = {
  messages: Message[];
};

export default function ChatThread({ messages }: ChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[url('/window.svg')] bg-[length:400px] bg-repeat">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
}
