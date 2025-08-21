import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseUploadsField(uploads: string | string[]): string[] {
  if (!uploads) return [];
  if (Array.isArray(uploads)) return uploads;
  if (typeof uploads === "string") {
    try {
      const parsed = JSON.parse(uploads);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return error as string[];
    }
  }
  return [];
}

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
        message: c.message,
        uploads: parseUploadsField(c.uploads || "[]"),
        sender: c.sender?.id,
        createdAt: c.createdAt,
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
