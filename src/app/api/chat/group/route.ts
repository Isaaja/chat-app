import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGroupPayload } from "./validate";

const AGENT_ID = "agent@mail.com";
const AGENT_NAME = "Agent A";
const AGENT_ROLE = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const errorResponse = await validateGroupPayload(body);
    if (errorResponse) return errorResponse;

    const { name, imageUrl, participants } = body;

    const room = await prisma.room.create({
      data: { name, imageUrl: imageUrl ?? null },
    });

    if (Array.isArray(participants) && participants.length > 0) {
      for (const p of participants) {
        const { id, name: participantName, role } = p;

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
    }

    await prisma.participant.upsert({
      where: { id: AGENT_ID },
      update: { name: AGENT_NAME, role: AGENT_ROLE },
      create: { id: AGENT_ID, name: AGENT_NAME, role: AGENT_ROLE },
    });
    await prisma.roomParticipant.upsert({
      where: {
        roomId_participantId: { roomId: room.id, participantId: AGENT_ID },
      },
      update: {},
      create: { roomId: room.id, participantId: AGENT_ID },
    });

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
