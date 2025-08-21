import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseClient } from "@/lib/client";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "IMAGE" | "VIDEO" | "DOCUMENT";
    const messageId = formData.get("messageId") as string;

    console.log("🔍 Upload Debug Info:");
    console.log(
      "- File:",
      file ? `${file.name} (${file.size} bytes, ${file.type})` : "NULL"
    );
    console.log("- Type:", type);
    console.log("- MessageId:", messageId);
    console.log("- FormData keys:", Array.from(formData.keys()));

    if (!file) {
      console.error("❌ File is missing");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!messageId) {
      console.error("❌ MessageId is missing");
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    if (!type || !["IMAGE", "VIDEO", "DOCUMENT"].includes(type)) {
      console.error("❌ Type is invalid:", type);
      return NextResponse.json(
        { error: "Valid type is required" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const message = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const path = `messages/${messageId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to upload file");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(path);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get file URL");
    }

    // Get current comment to read existing uploads
    const currentComment = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
    });

    if (!currentComment) {
      throw new Error("Comment not found for uploading file");
    }

    const currentUploads = currentComment.uploads || "[]";
    let uploadsArray: string[] = [];

    try {
      uploadsArray =
        typeof currentUploads === "string"
          ? JSON.parse(currentUploads)
          : currentUploads;
      if (!Array.isArray(uploadsArray)) {
        uploadsArray = [];
      }
    } catch (e) {
      console.log(e);
      uploadsArray = [];
    }

    uploadsArray.push(urlData.publicUrl);

    console.log(
      `Updating comment ${messageId} with uploads array:`,
      uploadsArray
    );

    await prisma.$executeRaw`
      UPDATE "Comment" 
      SET uploads = ${JSON.stringify(uploadsArray)}::jsonb
      WHERE id = ${Number(messageId)}
    `;

    const updatedComment = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
    });

    console.log("Updated comment uploads:", updatedComment?.uploads);

    const fileInfo = {
      id: Number(messageId),
      type,
      url: urlData.publicUrl,
      filename: file.name,
      fileSize: file.size,
      commentId: Number(messageId),
    };

    return NextResponse.json(fileInfo);
  } catch (err: unknown) {
    console.error("Upload error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to test uploads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: Number(messageId) },
      include: {
        sender: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: comment.id,
      message: comment.message,
      uploads: comment.uploads || [],
      sender: comment.sender,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    console.error("Get uploads error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
