import { NextResponse } from "next/server";

export async function validateGroupPayload(body: {
  name: string;
  participants: { id: string; name: string; role: number }[];
}) {
  const { name, participants } = body ?? {};

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "'name' is required and must be a string" },
      { status: 400 }
    );
  }

  if (participants && !Array.isArray(participants)) {
    return NextResponse.json(
      { error: "'participants' must be an array if provided" },
      { status: 400 }
    );
  }

  if (Array.isArray(participants)) {
    for (const p of participants) {
      if (!p || typeof p !== "object") {
        return NextResponse.json(
          { error: "Each participant must be an object" },
          { status: 400 }
        );
      }

      const { id, name, role } = p;

      if (!id || typeof id !== "string") {
        return NextResponse.json(
          { error: "Each participant must have a valid 'id' (string)" },
          { status: 400 }
        );
      }

      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { error: "Each participant must have a valid 'name' (string)" },
          { status: 400 }
        );
      }

      if (typeof role !== "number") {
        return NextResponse.json(
          { error: "Each participant must have a valid 'role' (number)" },
          { status: 400 }
        );
      }
    }
  }

  return null;
}
