import { useState, useCallback } from "react";
import {
  sendMessage,
  sendPersonalMessage,
  getMessages,
  getPersonalMessages,
  createGroup,
} from "@/services/chat";
import { validTypes } from "@/app/api/chat/personal/validate";

export interface ChatMessage {
  id: number;
  type: string;
  message: string;
  sender: {
    id: string;
    name: string;
    role: number;
  };
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  image_url?: string;
  participant: Array<{
    id: string;
    name: string;
    role: number;
  }>;
}

export interface UseChatReturn {
  // State
  messages: ChatMessage[];
  rooms: ChatRoom[];
  loading: boolean;
  error: string | null;

  // Actions
  sendMessageToRoom: (
    roomId: number,
    message: string,
    type?: string
  ) => Promise<void>;
  sendPersonalChat: (
    receiverId: string,
    message: string,
    type?: string
  ) => Promise<void>;
  loadRoomMessages: (
    roomId: number,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  loadPersonalMessages: (
    senderId: string,
    receiverId: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  createNewGroup: (
    name: string,
    participants: Array<{ id: string; name: string; role: number }>,
    imageUrl?: string
  ) => Promise<void>;
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessageToRoom = useCallback(
    async (roomId: number, message: string, type: string = "text") => {
      try {
        setLoading(true);
        setError(null);

        const response = await sendMessage({
          roomId,
          message,
          type: type as (typeof validTypes)[number],
        });

        setMessages((prev) => [response, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendPersonalChat = useCallback(
    async (receiverId: string, message: string, type: string = "text") => {
      try {
        setLoading(true);
        setError(null);

        const response = await sendPersonalMessage({
          receiverId,
          message,
          type: type as (typeof validTypes)[number],
        });

        // Add new message to the list
        setMessages((prev) => [response, ...prev]);

        // Update rooms if this is a new personal chat
        const existingRoom = rooms.find((room) => room.id === response.room.id);
        if (!existingRoom) {
          setRooms((prev) => [response.room, ...prev]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send personal message"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [rooms]
  );

  const loadRoomMessages = useCallback(
    async (roomId: number, limit: number = 50, offset: number = 0) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMessages(roomId, limit, offset);

        setMessages(response.comments);
        setRooms((prev) => {
          const existingRoomIndex = prev.findIndex(
            (room) => room.id === response.room.id
          );
          if (existingRoomIndex >= 0) {
            const updatedRooms = [...prev];
            updatedRooms[existingRoomIndex] = response.room;
            return updatedRooms;
          } else {
            return [response.room, ...prev];
          }
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadPersonalMessages = useCallback(
    async (
      senderId: string,
      receiverId: string,
      limit: number = 50,
      offset: number = 0
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getPersonalMessages(
          senderId,
          receiverId,
          limit,
          offset
        );

        if (response.room) {
          setMessages(response.comments);
          setRooms((prev) => {
            const existingRoomIndex = prev.findIndex(
              (room) => room.id === response.room.id
            );
            if (existingRoomIndex >= 0) {
              const updatedRooms = [...prev];
              updatedRooms[existingRoomIndex] = response.room;
              return updatedRooms;
            } else {
              return [response.room, ...prev];
            }
          });
        } else {
          setMessages([]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load personal messages"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createNewGroup = useCallback(
    async (
      name: string,
      participants: Array<{ id: string; name: string; role: number }>,
      imageUrl?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await createGroup({
          name,
          participants,
          imageUrl,
        });

        // Add new room to the list
        setRooms((prev) => [response.room, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create group");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    messages,
    rooms,
    loading,
    error,
    sendMessageToRoom,
    sendPersonalChat,
    loadRoomMessages,
    loadPersonalMessages,
    createNewGroup,
    clearError,
  };
}
