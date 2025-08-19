import { Chat, Message } from "@/features/chat/types";

// Client helper that calls our own API route to avoid CORS issues
export async function loadDummyData(): Promise<{
  chats: Chat[];
  messages: Message[];
  activeChatId?: string;
}> {
  const res = await fetch("/api/chat", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch dummy data: ${res.status}`);
  }
  const data = (await res.json()) as {
    chats: Chat[];
    messages: Message[];
    activeChatId?: string;
  };

  return data;
}

export default loadDummyData;
