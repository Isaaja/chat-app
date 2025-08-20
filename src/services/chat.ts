import type { Result, Comment } from "@/features/chat/types";

// Types matching the /api/chat response
type ApiParticipant = {
  id: string;
  name: string;
  role: number;
};

type ApiRoom = {
  id: number;
  name: string;
  image_url?: string;
  participant: ApiParticipant[];
};

type ApiComment = {
  id: number | string;
  type: string;
  message: string;
  sender: string;
};

type ApiResult = {
  room: ApiRoom;
  comments: ApiComment[];
};

type ApiResponse = {
  results?: ApiResult[];
};

function generateTimestamp(baseISO: string, offsetMinutes: number): string {
  const base = new Date(baseISO);
  base.setMinutes(base.getMinutes() + offsetMinutes);
  return base.toISOString();
}

export async function fetchChatData(): Promise<{
  chats: Result[];
  messages: Comment[];
  activeChatId?: string;
}> {
  const res = await fetch("/api/chat", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch chat data");
  }
  const data: ApiResponse = await res.json();

  const results: ApiResult[] = data.results ?? [];
  if (!results.length) {
    return { chats: [], messages: [], activeChatId: undefined };
  }

  const baseISO = new Date().toISOString();
  const chats: Result[] = [];
  const messages: Comment[] = [];

  results.forEach(({ room, comments }, roomIndex) => {
    const chat: Result = {
      room: {
        id: room.id,
        name: room.name,
        image_url: room.image_url,
        participant: room.participant,
      },
      comments: comments.map((c, idx) => ({
        id: c.id,
        type: c.type,
        message: c.message,
        sender: {
          id: c.sender,
          name: c.sender,
          avatar: undefined,
        },
        timestamp: generateTimestamp(baseISO, idx + roomIndex * 100),
      })),
    };
    chats.push(chat);

    chat.comments.forEach((c) => {
      messages.push(c);
    });
  });

  return {
    chats,
    messages,
    activeChatId: chats[0] ? String(chats[0].room.id) : undefined,
  };
}
