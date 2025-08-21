import { NextResponse } from "next/server";

export const validTypes = ["text", "image", "file", "audio", "video"] as const;

export function validatePost(body: {
  receiverId: string;
  message: string;
  type: string;
}) {
  const { receiverId, message, type = "text" } = body ?? {};

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json(
      { error: "'receiverId' is required and must be a string" },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "'message' is required and must be a string" },
      { status: 400 }
    );
  }

  if (!validTypes.includes(type as (typeof validTypes)[number])) {
    return NextResponse.json(
      { error: `'type' must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  return null;
}

export function validateGet(searchParams: URLSearchParams) {
  const receiverId = searchParams.get("receiverId");

  if (!receiverId) {
    return NextResponse.json(
      { error: "'receiverId' query parameter is required" },
      { status: 400 }
    );
  }

  return null;
}
