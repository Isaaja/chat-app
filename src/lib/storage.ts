import { supabase } from "./supabase";
import { prisma } from "./prisma";

export class StorageService {
  static async uploadFile(
    file: File,
    bucket: string,
    path: string
  ): Promise<{ url: string; error: null } | { url: null; error: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { url: null, error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch {
      return { url: null, error: "Upload failed" };
    }
  }

  // Upload avatar dan update user di database
  static async uploadUserAvatar(userId: string, file: File) {
    const fileName = `${userId}-${Date.now()}.${file.name.split(".").pop()}`;
    const filePath = `avatars/${fileName}`;

    // Upload ke Supabase Storage
    const uploadResult = await this.uploadFile(file, "avatars", filePath);

    if (uploadResult.error) {
      throw new Error(uploadResult.error);
    }
    return {
      userId,
      avatarUrl: uploadResult.url,
    };
  }

  static async uploadRoomImage(roomId: number, file: File) {
    const fileName = `${roomId}-${Date.now()}.${file.name.split(".").pop()}`;
    const filePath = `rooms/${fileName}`;

    const uploadResult = await this.uploadFile(file, "rooms", filePath);

    if (uploadResult.error) {
      throw new Error(uploadResult.error);
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { imageUrl: uploadResult.url },
    });

    return updatedRoom;
  }

  // Upload message attachment (photos, videos, PDF)
  static async uploadMessageAttachment(
    messageId: number,
    file: File,
    type: "IMAGE" | "VIDEO" | "DOCUMENT"
  ) {
    // Validate file type
    const allowedTypes = {
      IMAGE: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      VIDEO: ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"],
      DOCUMENT: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(
        `Invalid file type for ${type}. Allowed: ${allowedTypes[type].join(
          ", "
        )}`
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${messageId}-${Date.now()}.${fileExtension}`;

    // Determine bucket and path based on type
    const bucketConfig = {
      IMAGE: { bucket: "message-photos", path: `photos/${fileName}` },
      VIDEO: { bucket: "message-videos", path: `videos/${fileName}` },
      DOCUMENT: { bucket: "message-documents", path: `documents/${fileName}` },
    };

    const config = bucketConfig[type];

    // Upload to Supabase Storage
    const uploadResult = await this.uploadFile(
      file,
      config.bucket,
      config.path
    );

    if (uploadResult.error) {
      throw new Error(uploadResult.error);
    }

    // Create attachment record in database
    const attachment = await prisma.attachment.create({
      data: {
        type: type,
        url: uploadResult.url!,
        commentId: messageId,
      },
    });

    return {
      id: attachment.id,
      type: attachment.type,
      url: attachment.url,
      fileName: file.name,
      fileSize: file.size,
      commentId: messageId,
    };
  }

  // Upload multiple message attachments
  static async uploadMultipleMessageAttachments(
    messageId: number,
    files: { file: File; type: "IMAGE" | "VIDEO" | "DOCUMENT" }[]
  ) {
    const uploadPromises = files.map(({ file, type }) =>
      this.uploadMessageAttachment(messageId, file, type)
    );

    const results = await Promise.allSettled(uploadPromises);

    const successful = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) =>
          (
            result as PromiseFulfilledResult<{
              id: number;
              type: string;
              url: string;
              fileName: string;
              fileSize: number;
              commentId: number;
            }>
          ).value
      );

    const failed = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .map((result) => result.reason.message);

    return { successful, failed };
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async deleteUserAvatar(avatarUrl: string) {
    if (avatarUrl) {
      // Extract path from URL
      const url = new URL(avatarUrl);
      const path = url.pathname.split("/").slice(-2).join("/");

      // Delete dari storage
      await this.deleteFile("avatars", path);
    }
  }

  static async deleteRoomImage(roomId: number) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (room?.imageUrl) {
      // Extract path from URL
      const url = new URL(room.imageUrl);
      const path = url.pathname.split("/").slice(-2).join("/");

      // Delete dari storage
      await this.deleteFile("rooms", path);

      // Update database
      await prisma.room.update({
        where: { id: roomId },
        data: { imageUrl: null },
      });
    }
  }

  // Delete message attachment
  static async deleteMessageAttachment(attachmentId: number) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Extract path from URL
    const url = new URL(attachment.url);
    const path = url.pathname.split("/").slice(-2).join("/");

    // Determine bucket based on attachment type
    const bucketConfig = {
      IMAGE: "message-photos",
      VIDEO: "message-videos",
      DOCUMENT: "message-documents",
    };

    const bucket = bucketConfig[attachment.type as keyof typeof bucketConfig];

    // Delete from storage
    await this.deleteFile(bucket, path);

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { success: true, deletedId: attachmentId };
  }

  // Delete all attachments for a message
  static async deleteMessageAttachments(messageId: number) {
    const attachments = await prisma.attachment.findMany({
      where: { commentId: messageId },
    });

    const deletePromises = attachments.map((attachment) =>
      this.deleteMessageAttachment(attachment.id)
    );

    const results = await Promise.allSettled(deletePromises);

    type DeleteResult = {
      success: boolean;
      deletedId: number;
    };

    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<DeleteResult> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    const failed = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .map((result) => result.reason.message);

    return { successful, failed };
  }
}
