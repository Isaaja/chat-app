import { NextResponse } from "next/server";
import { prisma } from "@/lib/client";

const AGENT_ID = "agent@mail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, role } = body ?? {};

    if (!id || !name || typeof role !== "number") {
      return NextResponse.json(
        { error: "'id', 'name' and numeric 'role' are required" },
        { status: 400 }
      );
    }

    // Agent A constants
    const AGENT_ID = "agent@mail.com";
    const AGENT_NAME = "Agent A";
    const AGENT_ROLE = 1;

    // Upsert the new participant
    const participant = await prisma.participant.upsert({
      where: { id },
      update: { name, role },
      create: { id, name, role: 2 },
    });

    // Ensure Agent A exists
    await prisma.participant.upsert({
      where: { id: AGENT_ID },
      update: { name: AGENT_NAME, role: AGENT_ROLE },
      create: { id: AGENT_ID, name: AGENT_NAME, role: AGENT_ROLE },
    });

    const personalRoom = await prisma.room.create({
      data: {
        name: participant.name,
        imageUrl: null,
        participants: {
          create: [
            { participantId: AGENT_ID },
            { participantId: participant.id },
          ],
        },
      },
      include: {
        participants: {
          include: { participant: true },
        },
      },
    });

    return NextResponse.json(
      {
        participant,
        room: {
          id: personalRoom.id,
          name: participant.name,
          image_url: personalRoom.imageUrl,
          participant: personalRoom.participants.map((p) => ({
            id: p.participant.id,
            name: p.participant.name,
            role: p.participant.role,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      where: { id: { not: AGENT_ID } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(participants);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
