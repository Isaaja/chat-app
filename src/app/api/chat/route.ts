import { prisma } from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        participants: {
          include: {
            participant: true,
          },
        },
        comments: {
          include: {
            sender: true,
          },
        },
      },
    });

    const results = rooms.map((room) => ({
      room: {
        id: room.id,
        name: room.name,
        image_url: room.imageUrl,
        participant: room.participants.map((p) => ({
          id: p.participant.id,
          name: p.participant.name,
          role: p.participant.role,
        })),
      },
      comments: room.comments.map((c) => ({
        id: c.id,
        type: c.type,
        message: c.message,
        sender: c.sender?.id,
      })),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
