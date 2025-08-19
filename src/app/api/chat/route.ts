import { NextResponse } from "next/server";
import type { Chat, Message } from "@/features/chat/types";
import axios from "axios";

const ENDPOINT = "https://bit.ly/chat_room_endpoint";

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

type Comment = {
  id: number | string;
  type: string;
  message: string;
  sender: string;
};

type ApiResponse = {
  results?: Array<{
    room: Room;
    comments: Comment[];
  }>;
  room?: Room;
  comments?: Comment[];
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

export async function GET() {
  try {
    const { data } = await axios.get<ApiResponse>(ENDPOINT, { timeout: 15000 });

    const payload =
      data.results?.[0] ??
      (data.room && data.comments
        ? { room: data.room, comments: data.comments }
        : undefined);
    if (!payload) {
      return NextResponse.json({
        chats: [],
        messages: [],
        activeChatId: undefined,
      });
    }

    const { room, comments } = payload;
    const meEmail = pickMeEmail(room);
    const baseISO = "2024-01-01T09:00:00.000Z";

    const chat: Chat = {
      id: String(room.id),
      name: room.name,
      avatarUrl: room.image_url,
      avatarLetter: room.name?.[0]?.toUpperCase(),
      lastMessage: comments?.[comments.length - 1]?.message ?? "",
      lastTimestamp: generateTimestamp(baseISO, comments.length),
    };

    const messages: Message[] = (comments ?? []).map((c, idx) => ({
      id: String(c.id),
      chatId: String(room.id),
      author: c.sender === meEmail ? "me" : "them",
      text: c.message,
      timestamp: generateTimestamp(baseISO, idx),
      status: "read",
    }));

    return NextResponse.json({
      chats: [chat],
      messages,
      activeChatId: chat.id,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
