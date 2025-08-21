import { NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function validateMessagePayload(body: {
  roomId: number;
  senderId: string;
  message?: string;
}) {
  const { roomId, senderId, message } = body;

  if (!roomId || typeof roomId !== "number") {
    return NextResponse.json(
      { error: "'roomId' must be a number" },
      { status: 400 }
    );
  }

  if (!senderId || typeof senderId !== "string") {
    return NextResponse.json(
      { error: "'senderId' must be a string" },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Text messages require 'message'" },
      { status: 400 }
    );
  }

  // ✅ cek room & sender
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { participants: { include: { participant: true } } },
  });

  if (!room)
    return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const isParticipant = room.participants.some(
    (p) => p.participant.id === senderId
  );
  if (!isParticipant)
    return NextResponse.json(
      { error: "Sender is not a participant in this room" },
      { status: 403 }
    );

  const sender = await prisma.participant.findUnique({
    where: { id: senderId },
  });
  if (!sender)
    return NextResponse.json({ error: "Sender not found" }, { status: 404 });

  return null;
}
