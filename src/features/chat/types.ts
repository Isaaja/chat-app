export type MessageAuthor = "me" | "them";

export interface Chat {
  id: string;
  name: string;
  avatarLetter?: string;
  avatarUrl?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  author: MessageAuthor;
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}
