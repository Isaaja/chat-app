import { Chat, Message } from "../types";

export const mockChats: Chat[] = [
  {
    id: "1",
    name: "Dewi Lestari",
    avatarLetter: "D",
    lastMessage: "Sampai ketemu nanti sore ya!",
    lastTimestamp: new Date().toISOString(),
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Rudi",
    avatarLetter: "R",
    lastMessage: "Siap, makasih!",
    lastTimestamp: new Date().toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    chatId: "1",
    author: "them",
    text: "Halo!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "read",
  },
  {
    id: "m2",
    chatId: "1",
    author: "me",
    text: "Hai, apa kabar?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "read",
  },
  {
    id: "m3",
    chatId: "1",
    author: "them",
    text: "Baik, kamu?",
    timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    status: "read",
  },
  {
    id: "m4",
    chatId: "2",
    author: "me",
    text: "Oke, noted.",
    timestamp: new Date().toISOString(),
    status: "delivered",
  },
];
