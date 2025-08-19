import { http } from "@/lib/http";
import type { Chat, Message } from "@/features/chat/types";

export async function fetchChatData(): Promise<{
  chats: Chat[];
  messages: Message[];
  activeChatId?: string;
}> {
  const res = await http.get<{
    chats: Chat[];
    messages: Message[];
    activeChatId?: string;
  }>("/api/chat");
  return res.data;
}
