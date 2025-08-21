import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to parse uploads field (handles both JSON string and array)
function parseUploadsField(uploads: any): string[] {
  if (!uploads) return [];
  if (Array.isArray(uploads)) return uploads;
  if (typeof uploads === "string") {
    try {
      const parsed = JSON.parse(uploads);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId required" },
        { status: 400 }
      );
    }

    // Get comment with all fields
    const comment = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
      include: {
        sender: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check database schema
    const schemaInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Comment' 
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      comment: {
        id: comment.id,
        message: comment.message,
        uploads: parseUploadsField((comment as any).uploads),
        createdAt: comment.createdAt,
        sender: comment.sender,
      },
      schema: schemaInfo,
      rawComment: comment,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}

// Test manual update
export async function POST(req: NextRequest) {
  try {
    const { messageId, testUrl } = await req.json();

    if (!messageId || !testUrl) {
      return NextResponse.json(
        { error: "messageId and testUrl required" },
        { status: 400 }
      );
    }

    console.log(
      `Manual test update for message ${messageId} with URL: ${testUrl}`
    );

    // Try raw SQL update with JSON
    await prisma.$executeRaw`
      UPDATE "Comment" 
      SET uploads = ${JSON.stringify([testUrl])}::jsonb
      WHERE id = ${Number(messageId)}
    `;

    // Get updated comment
    const updated = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
    });

    return NextResponse.json({
      success: true,
      updated: {
        id: updated?.id,
        message: updated?.message,
        uploads: parseUploadsField((updated as any)?.uploads),
      },
    });
  } catch (error) {
    console.error("Manual update error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
