import { NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function validateMessagePayload(body: {
  roomId: number;
  senderId: string;
  message: string;
  type: string;
}) {
  const { roomId, senderId, message, type } = body;

  if (!roomId || typeof roomId !== "number") {
    return NextResponse.json(
      { error: "'roomId' is required and must be a number" },
      { status: 400 }
    );
  }

  if (!senderId || typeof senderId !== "string") {
    return NextResponse.json(
      { error: "'senderId' is required and must be a string" },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "'message' is required and must be a string" },
      { status: 400 }
    );
  }

  const validTypes = ["text", "image", "file", "audio", "video"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: "'type' must be one of: text, image, file, audio, video" },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        include: { participant: true },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isParticipant = room.participants.some(
    (p) => p.participant.id === senderId
  );

  if (!isParticipant) {
    return NextResponse.json(
      { error: "Sender is not a participant in this room" },
      { status: 403 }
    );
  }

  const sender = await prisma.participant.findUnique({
    where: { id: senderId },
  });

  if (!sender) {
    return NextResponse.json({ error: "Sender not found" }, { status: 404 });
  }

  return null;
}
