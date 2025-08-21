// types/chat.ts

export interface Participant {
  id: string;
  name: string;
  role: number;
}

export interface Room {
  id: string | number;
  name: string;
  image_url?: string;
  participant: Participant[];
}

export interface Sender {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string | number;
  comment: string;
  type: string;
  message: string;
  sender: Sender;
  timestamp?: string;
  status?: "pending" | "delivered" | "failed";
  uploads?: string[];
}

export interface Result {
  room: Room;
  comments: (Comment | ChatComment)[];
}

export interface ApiResponse {
  results?: Result[];
  room?: Room;
  comments?: (Comment | ChatComment)[];
}

export type ChatComment = {
  id: string;
  type: "text" | "image" | "file" | "audio" | "video";
  message: string;
  comment?: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  status: "pending" | "delivered" | "failed";
  tempId?: string;
  uploads?: string[];
};
