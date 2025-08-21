"use client";
import { useState, ChangeEvent } from "react";
import {
  Link,
  SendHorizonal,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { sendMessage } from "@/services/chat";
import type { ChatComment } from "@/features/chat/types";

type ChatInputProps = {
  onMessageSent?: (message: ChatComment) => void;
  onUpload: (file: File) => void;
  roomId?: number;
};

export default function ChatInput({
  onMessageSent,
  onUpload,
  roomId,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!roomId) return;

    (async () => {
      try {
        setSubmitting(true);
        // optimistic pending message
        const pending: ChatComment = {
          id: crypto.randomUUID(),
          type: "text",
          message: trimmed,
          sender: { id: "me", name: "Me", avatar: undefined },
          timestamp: new Date().toISOString(),
          status: "pending",
        };
        onMessageSent?.(pending);

        const created = await sendMessage({
          roomId,
          message: trimmed,
          type: "text",
        });

        const delivered: ChatComment = {
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
        };
        onMessageSent?.(delivered);
        setText("");
      } catch (err) {
        console.error("Failed to send message:", err);
      } finally {
        setSubmitting(false);
      }
    })();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
    setShowOptions(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-black p-3 flex items-end gap-2 bg-base-300 text-white relative"
    >
      <div className="relative h-10 rounded-xl flex items-center justify-center">
        <button
          type="button"
          className="btn btn-ghost btn-sm justify-center items-center h-full"
          aria-label="Add attachment"
          onClick={() => setShowOptions((prev) => !prev)}
        >
          <Link className="w-5 h-5" />
        </button>

        {showOptions && (
          <div className="absolute bottom-10 left-0 bg-base-200 text-white  shadow-lg rounded-md flex flex-col w-40 p-2 gap-2 z-10">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-base-100">
              <ImageIcon className="w-4 h-4" />
              Photos & Videos
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-base-100">
              <FileText className="w-4 h-4" />
              Documents
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="Type a message"
        className="input input-bordered flex-1 rounded-full bg-base-100"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const trimmed = text.trim();
            if (!trimmed) return;
            setText("");
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
        aria-label="Message input"
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!text.trim() || submitting || !roomId}
        aria-label="Send message"
      >
        <SendHorizonal />
      </button>
    </form>
  );
}
