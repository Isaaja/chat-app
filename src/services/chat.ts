import type { Result, Comment, Participant } from "@/features/chat/types";

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

export async function fetchParticipants(): Promise<Participant[]> {
  const res = await fetch("/api/chat/participant", { cache: "no-store" });
  if (!res.ok) {
    await throwHttpError(res, "Failed to fetch participants");
  }
  const data: Participant[] = await res.json();
  return data;
}

type SendMessageData = {
  roomId: number;
  message: string;
  type?: "text" | "image" | "file" | "audio" | "video";
};

type SendPersonalMessageData = {
  receiverId: string;
  message: string;
  type?: "text" | "image" | "file" | "audio" | "video";
};

type MessageResponse = {
  id: number;
  type: string;
  message: string;
  sender: {
    id: string;
    name: string;
    role: number;
  };
  room: {
    id: number;
    name: string;
    image_url?: string;
    participant: ApiParticipant[];
  };
  createdAt: string;
};

type GetMessagesResponse = {
  room: ApiRoom;
  comments: Array<{
    id: number;
    type: string;
    message: string;
    sender: {
      id: string;
      name: string;
      role: number;
    };
    createdAt: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

// ---------- Helper error handlers ----------
async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function readTextSafe(res: Response): Promise<string | null> {
  try {
    return await res.text();
  } catch {
    return null;
  }
}

async function throwHttpError(res: Response, fallbackMessage: string) {
  const data = await parseJsonSafe<{ error?: string; message?: string }>(res);
  const text = data?.error || data?.message || (await readTextSafe(res));
  const message = text?.trim() || `${fallbackMessage} (HTTP ${res.status})`;
  throw new Error(message);
}

/**
 * Mengirim pesan ke room yang sudah ada (group atau personal)
 */
export async function sendMessage(
  data: SendMessageData
): Promise<MessageResponse> {
  const res = await fetch("/api/chat/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwHttpError(res, "Failed to send message");
  }

  return res.json();
}

/**
 * Mengirim pesan personal antara dua user
 */
export async function sendPersonalMessage(
  data: SendPersonalMessageData
): Promise<MessageResponse> {
  const res = await fetch("/api/chat/personal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwHttpError(res, "Failed to send personal message");
  }

  return res.json();
}

/**
 * Mengambil pesan dari room tertentu dengan pagination
 */
export async function getMessages(
  roomId: number,
  limit: number = 50,
  offset: number = 0
): Promise<GetMessagesResponse> {
  const res = await fetch(
    `/api/chat/message?roomId=${roomId}&limit=${limit}&offset=${offset}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    await throwHttpError(res, "Failed to fetch messages");
  }

  return res.json();
}

/**
 * Mengambil pesan personal antara dua user
 */
export async function getPersonalMessages(
  senderId: string,
  receiverId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GetMessagesResponse> {
  const res = await fetch(
    `/api/chat/personal?senderId=${senderId}&receiverId=${receiverId}&limit=${limit}&offset=${offset}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    await throwHttpError(res, "Failed to fetch personal messages");
  }

  return res.json();
}

/**
 * Membuat group chat baru
 */
export async function createGroup(data: {
  name: string;
  imageUrl?: string;
  participants?: Array<{
    id: string;
    name: string;
    role: number;
  }>;
}): Promise<ApiResult> {
  const res = await fetch("/api/chat/group", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwHttpError(res, "Failed to create group");
  }

  return res.json();
}
