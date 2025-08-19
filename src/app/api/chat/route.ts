import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://bit.ly/chat_room_endpoint");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    // biarkan response sesuai format asli endpoint
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
