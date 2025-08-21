"use client";
import { useState, ChangeEvent } from "react";
import {
  Link,
  SendHorizonal,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import { sendMessage } from "@/services/chat";
import type { ChatComment } from "@/features/chat/types";
import Image from "next/image";
type ChatInputProps = {
  onMessageSent?: (message: ChatComment) => void;
  roomId?: number;
};

export default function ChatInput({ onMessageSent, roomId }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !roomId) return;

    setText("");

    const tempId = crypto.randomUUID();

    const pendingMessage: ChatComment = {
      id: tempId,
      type: "text",
      message: trimmed,
      sender: { id: "me", name: "Me", avatar: undefined },
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    onMessageSent?.(pendingMessage);

    (async () => {
      try {
        setSubmitting(true);
        const created = await sendMessage({
          roomId,
          message: trimmed,
          type: "text",
        });

        const deliveredMessage: ChatComment = {
          id: String(created.id),
          type: created.type as ChatComment["type"],
          message: created.message,
          sender: {
            id: created.sender.id,
            name: created.sender.name,
            avatar: undefined,
          },
          timestamp: new Date(created.createdAt).toISOString(),
          status: "delivered",
          tempId: tempId,
        };
        onMessageSent?.(deliveredMessage);
      } catch (err) {
        console.error("Failed to send message:", err);
        onMessageSent?.({ ...pendingMessage, status: "failed" });
      } finally {
        setSubmitting(false);
      }
    })();
  }

  // Helper function to determine attachment type
  function getAttachmentType(mimeType: string): "IMAGE" | "VIDEO" | "DOCUMENT" {
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType.startsWith("video/")) return "VIDEO";
    return "DOCUMENT";
  }

  // Get document info for preview
  function getDocumentInfo(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";

    switch (ext) {
      case "pdf":
        return {
          icon: "📄",
          color: "bg-red-100 text-red-600",
          name: "PDF",
          colorClass: "border-red-200",
        };
      case "doc":
      case "docx":
        return {
          icon: "📝",
          color: "bg-blue-100 text-blue-600",
          name: "Word",
          colorClass: "border-blue-200",
        };
      case "xls":
      case "xlsx":
        return {
          icon: "📊",
          color: "bg-green-100 text-green-600",
          name: "Excel",
          colorClass: "border-green-200",
        };
      case "ppt":
      case "pptx":
        return {
          icon: "📈",
          color: "bg-orange-100 text-orange-600",
          name: "PowerPoint",
          colorClass: "border-orange-200",
        };
      case "txt":
        return {
          icon: "📋",
          color: "bg-gray-100 text-gray-600",
          name: "Text",
          colorClass: "border-gray-200",
        };
      case "zip":
      case "rar":
      case "7z":
        return {
          icon: "🗜️",
          color: "bg-purple-100 text-purple-600",
          name: "Archive",
          colorClass: "border-purple-200",
        };
      default:
        return {
          icon: "📎",
          color: "bg-gray-100 text-gray-600",
          name: "File",
          colorClass: "border-gray-200",
        };
    }
  }

  function formatFileSize(bytes: number) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    e.target.value = "";
    setShowOptions(false);

    // Client-side validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(
        `File too large! Maximum size is 10MB. Your file: ${(
          file.size /
          1024 /
          1024
        ).toFixed(1)}MB`
      );
      return;
    }

    // Validate file type
    const attachmentType = getAttachmentType(file.type);
    console.log("📁 File selected:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      attachmentType,
    });

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  // Upload file attachment to existing message
  async function uploadFileAttachment(messageId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("messageId", String(messageId));
    formData.append("type", getAttachmentType(file.type));

    // Debug logging
    console.log("📤 ChatInput Upload Debug:");
    console.log("- MessageId:", messageId);
    console.log(
      "- File:",
      file ? `${file.name} (${file.size} bytes, ${file.type})` : "NULL"
    );
    console.log("- AttachmentType:", getAttachmentType(file.type));

    const response = await fetch("/api/chat/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Upload failed:",
        response.status,
        response.statusText,
        errorText
      );
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async function handleSendFile() {
    if (!pendingFile || !roomId) return;

    const tempId = crypto.randomUUID();
    const attachmentType = getAttachmentType(pendingFile.type);

    const pendingMessage: ChatComment = {
      id: tempId,
      type: "file",
      message: "", // Empty message for file-only uploads
      sender: { id: "me", name: "Me", avatar: undefined },
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    onMessageSent?.(pendingMessage);

    try {
      setUploading(true);

      // Step 1: Create message first (empty message for file only)
      const createdMessage = await sendMessage({
        roomId,
        message: "", // Empty message for file uploads
        type: "file",
      });

      // Step 2: Upload file attachment to the created message
      const attachment = await uploadFileAttachment(
        createdMessage.id,
        pendingFile
      );

      // Step 3: Update message with attachment info
      const deliveredMessage: ChatComment = {
        id: String(createdMessage.id),
        type: "file",
        message: "", // Empty message for file-only uploads
        sender: {
          id: createdMessage.sender.id,
          name: createdMessage.sender.name,
          avatar: undefined,
        },
        timestamp: new Date(createdMessage.createdAt).toISOString(),
        status: "delivered",
        tempId: tempId,
      };

      onMessageSent?.(deliveredMessage);

      setPendingFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("File upload failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";

      onMessageSent?.({
        ...pendingMessage,
        status: "failed",
        message: `❌ Upload failed: ${errorMessage}`,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Preview Area */}
      {pendingFile && (
        <div className="relative bg-base-200 rounded-lg p-3 flex flex-col gap-3 w-full max-h-96">
          {/* Cancel Button */}
          <button
            type="button"
            className="absolute top-2 right-2 btn btn-ghost btn-sm p-1"
            onClick={() => {
              setPendingFile(null);
              setPreviewUrl(null);
            }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* File / Image / Video Preview */}
          <div className="flex justify-center items-center max-h-48">
            {previewUrl && pendingFile.type.startsWith("image/") ? (
              <Image
                src={previewUrl}
                alt="preview"
                width={144}
                height={144}
                className="object-contain rounded-md max-h-48 w-full"
              />
            ) : previewUrl && pendingFile.type.startsWith("video/") ? (
              <video
                src={previewUrl}
                className="object-contain rounded-md max-h-48 w-full"
                controls
                preload="metadata"
              />
            ) : (
              /* Document Preview */
              <div
                className={`w-full max-w-sm bg-white rounded-xl p-4 border-2 ${
                  getDocumentInfo(pendingFile.name).colorClass
                } shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  {/* Document Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      getDocumentInfo(pendingFile.name).color
                    }`}
                  >
                    <span className="text-2xl">
                      {getDocumentInfo(pendingFile.name).icon}
                    </span>
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 truncate text-sm">
                        {pendingFile.name}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getDocumentInfo(pendingFile.name).color
                        }`}
                      >
                        {getDocumentInfo(pendingFile.name).name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        📏 {formatFileSize(pendingFile.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        📎 Ready to upload
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getDocumentInfo(
                      pendingFile.name
                    )
                      .color.replace("100", "500")
                      .replace("text-", "bg-")} w-full animate-pulse`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm self-end"
            onClick={handleSendFile}
            disabled={uploading}
          >
            {uploading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      )}

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 flex items-end gap-2 bg-base-300 text-white rounded-t-lg"
      >
        {/* Attachment Button */}
        <div className="relative flex items-center justify-center h-10">
          <button
            type="button"
            className="btn btn-ghost btn-sm justify-center items-center h-full"
            aria-label="Add attachment"
            onClick={() => setShowOptions((prev) => !prev)}
          >
            <Link className="w-5 h-5" />
          </button>

          {showOptions && (
            <div className="absolute bottom-12 left-0 bg-base-200 text-white shadow-lg rounded-md flex flex-col w-44 p-2 gap-2 z-10">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-base-100 p-1 rounded">
                <ImageIcon className="w-4 h-4" />
                Photos & Videos
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-base-100 p-1 rounded">
                <FileText className="w-4 h-4" />
                Documents
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Type a message"
          className="input input-bordered flex-1 rounded-full bg-base-100 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Message input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!text.trim() || submitting || uploading || !roomId}
          aria-label="Send message"
        >
          {uploading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <SendHorizonal />
          )}
        </button>
      </form>
    </div>
  );
}
