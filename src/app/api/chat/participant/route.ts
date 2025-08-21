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

    const participant = await prisma.participant.upsert({
      where: { id },
      update: { name, role },
      create: { id, name, role: 2 },
    });

    return NextResponse.json(participant, { status: 201 });
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
