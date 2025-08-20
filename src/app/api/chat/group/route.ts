import { NextResponse } from "next/server";
import { prisma } from "@/lib/client";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, imageUrl, participants } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "'name' is required" },
        { status: 400 }
      );
    }

    const roomId = nanoid(16);
    const room = await prisma.room.create({
      data: { id: parseInt(roomId), name, imageUrl: imageUrl ?? null },
    });

    if (Array.isArray(participants) && participants.length > 0)
      for (const p of participants) {
        if (!p || typeof p !== "object") continue;
        const {
          id,
          name: participantName,
          role,
        } = p as {
          id?: string;
          name?: string;
          role?: number;
        };
        if (!id || !participantName || typeof role !== "number") continue;

        await prisma.participant.upsert({
          where: { id },
          update: { name: participantName, role },
          create: { id, name: participantName, role },
        });

        await prisma.roomParticipant.upsert({
          where: {
            roomId_participantId: {
              roomId: room.id,
              participantId: id,
            },
          },
          update: {},
          create: { roomId: room.id, participantId: id },
        });
      }

    const created = await prisma.room.findUnique({
      where: { id: room.id },
      include: {
        participants: { include: { participant: true } },
        comments: { include: { sender: true } },
      },
    });

    if (!created) {
      return NextResponse.json(
        { error: "Failed to load created room" },
        { status: 500 }
      );
    }

    const response = {
      room: {
        id: created.id,
        name: created.name,
        image_url: created.imageUrl,
        participant: created.participants.map((p) => ({
          id: p.participant.id,
          name: p.participant.name,
          role: p.participant.role,
        })),
      },
      comments: created.comments.map((c) => ({
        id: c.id,
        type: c.type,
        message: c.message,
        sender: c.sender?.id,
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
