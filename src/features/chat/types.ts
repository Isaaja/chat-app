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
  type: string;
  message: string;
  sender: Sender;
  timestamp?: string; // kalau ada
}

export interface Result {
  room: Room;
  comments: Comment[];
}

export interface ApiResponse {
  results?: Result[];
  room?: Room;
  comments?: Comment[];
}
