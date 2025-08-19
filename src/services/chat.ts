import { http } from "@/lib/http";
import type { Result, Comment } from "@/features/chat/types";

type Participant = {
  id: string;
  name: string;
  role: number;
};

type Room = {
  name: string;
  id: number | string;
  image_url?: string;
  participant: Participant[];
};

type ApiComment = {
  id: number | string;
  type: string;
  message: string;
  sender: string;
};

type ApiResponse = {
  results?: Array<{
    room: Room;
    comments: ApiComment[];
  }>;
  room?: Room;
  comments?: ApiComment[];
};

function pickMeEmail(room: Room): string | undefined {
  const agent = room.participant?.find((p) => p.role === 1);
  return agent?.id ?? room.participant?.[0]?.id;
}

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
  const res = await http.get<ApiResponse>("/api/chat");
  const data = res.data;

  const results =
    data.results ??
    (data.room && data.comments
      ? [{ room: data.room, comments: data.comments }]
      : []);

  if (!results.length) {
    return { chats: [], messages: [], activeChatId: undefined };
  }

  const baseISO = "2024-01-01T09:00:00.000Z";
  const chats: Result[] = [];
  const messages: Comment[] = [];

  results.forEach(({ room, comments }, roomIndex) => {
    const meEmail = pickMeEmail(room);

    const chat: Result = {
      room,
      comments: comments.map((c) => ({
        id: c.id,
        type: c.type,
        message: c.message,
        sender: {
          id: c.sender,
          name: c.sender,
          avatar: undefined,
        },
        timestamp: generateTimestamp(
          baseISO,
          comments.indexOf(c) + roomIndex * 100
        ),
      })),
    };
    chats.push(chat);

    // Add all comments to messages array
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
