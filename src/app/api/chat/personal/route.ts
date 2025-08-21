import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePost, validateGet } from "./validate";

const AGENT_ID = "agent@mail.com";
const AGENT_NAME = "Agent A";
const AGENT_ROLE = 1;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationError = validatePost(body);
    if (validationError) return validationError;

    const { receiverId, message } = body;

    const receiver = await prisma.participant.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    await prisma.participant.upsert({
      where: { id: AGENT_ID },
      update: { name: AGENT_NAME, role: AGENT_ROLE },
      create: { id: AGENT_ID, name: AGENT_NAME, role: AGENT_ROLE },
    });

    let personalRoom = await prisma.room.findFirst({
      where: {
        AND: [
          { participants: { some: { participantId: AGENT_ID } } },
          { participants: { some: { participantId: receiverId } } },
        ],
      },
      include: { participants: { include: { participant: true } } },
    });

    if (personalRoom && personalRoom.participants.length !== 2) {
      personalRoom = null as unknown as typeof personalRoom;
    }

    if (!personalRoom) {
      personalRoom = await prisma.room.create({
        data: {
          name: `Personal: ${AGENT_NAME} & ${receiver.name}`,
          participants: {
            create: [
              { participantId: AGENT_ID },
              { participantId: receiverId },
            ],
          },
        },
        include: { participants: { include: { participant: true } } },
      });
    }

    const newComment = await prisma.comment.create({
      data: {
        message,
        roomId: personalRoom.id,
        senderId: AGENT_ID,
      },
      include: {
        sender: true,
        room: { include: { participants: { include: { participant: true } } } },
      },
    });

    return NextResponse.json(
      {
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const validationError = validateGet(searchParams);
    if (validationError) return validationError;

    const receiverId = searchParams.get("receiverId")!;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const room = await prisma.room.findFirst({
      where: {
        AND: [
          { participants: { some: { participantId: AGENT_ID } } },
          { participants: { some: { participantId: receiverId } } },
        ],
      },
    });

    if (!room) {
      return NextResponse.json({
        room: null,
        comments: [],
        pagination: { limit, offset, total: 0 },
      });
    }

    const comments = await prisma.comment.findMany({
      where: { roomId: room.id },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const participants = await prisma.roomParticipant.findMany({
      where: { roomId: room.id },
      include: { participant: true },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        image_url: null,
        participant: participants
          .filter((p) => p.participant.role !== AGENT_ROLE)
          .map((p) => ({
            id: p.participant.id,
            name: p.participant.name,
            role: p.participant.role,
          })),
      },
      comments: comments.map((c) => ({
        id: c.id,
        message: c.message,
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
        total: await prisma.comment.count({ where: { roomId: room.id } }),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
