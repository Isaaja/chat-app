import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMessagePayload } from "./validate";
import { parseUploadsField } from "@/services/chat";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, senderId, message } = body ?? {};
    if (senderId) {
      const validationError = await validateMessagePayload({
        roomId,
        senderId,
        message,
      });
      if (validationError) return validationError;
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: { include: { participant: true } } },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    let computedSenderId = senderId;
    if (!computedSenderId) {
      const agentId = "agent@mail.com";
      const agentName = "Agent A";

      await prisma.participant.upsert({
        where: { id: agentId },
        update: { name: agentName, role: 1 },
        create: { id: agentId, name: agentName, role: 1 },
      });

      await prisma.roomParticipant.upsert({
        where: {
          roomId_participantId: { roomId, participantId: agentId },
        },
        update: {},
        create: { roomId, participantId: agentId },
      });

      computedSenderId = agentId;
    }

    const newComment = await prisma.comment.create({
      data: {
        message,
        roomId,
        senderId: computedSenderId!,
      },
      include: {
        sender: true,
        room: {
          include: { participants: { include: { participant: true } } },
        },
      },
    });

    const response = {
      id: newComment.id,
      message: newComment.message,
      sender: {
        id: newComment.sender.id,
        name: newComment.sender.name,
        role: newComment.sender.role,
      },
      room: {
        id: newComment.room.id,
        name: newComment.room.name,
        image_url: newComment.room.imageUrl,
        participant: newComment.room.participants.map((p) => ({
          id: p.participant.id,
          name: p.participant.name,
          role: p.participant.role,
        })),
      },
      createdAt: newComment.createdAt,
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!roomId) {
      return NextResponse.json(
        { error: "'roomId' query parameter is required" },
        { status: 400 }
      );
    }

    const roomIdNum = parseInt(roomId);
    if (isNaN(roomIdNum)) {
      return NextResponse.json(
        { error: "'roomId' must be a valid number" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomIdNum },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { roomId: roomIdNum },
      include: {
        sender: true,
        room: {
          include: {
            participants: {
              include: { participant: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const response = {
      room: {
        id: room.id,
        name: room.name,
        image_url: room.imageUrl,
        participant:
          comments[0]?.room.participants.map((p) => ({
            id: p.participant.id,
            name: p.participant.name,
            role: p.participant.role,
          })) || [],
      },
      comments: comments.map((c) => ({
        id: c.id,
        message: c.message,
        uploads: parseUploadsField(c.uploads ? JSON.parse(c.uploads) : []),
        sender: {
          id: c.sender.id,
          name: c.sender.name,
          role: c.sender.role,
        },
        createdAt: c.createdAt,
      })),
      pagination: {
        limit,
        offset,
        total: await prisma.comment.count({ where: { roomId: roomIdNum } }),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
