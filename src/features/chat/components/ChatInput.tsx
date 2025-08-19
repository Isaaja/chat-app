"use client";
import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-base-300 p-3 flex items-end gap-2"
    >
      <button type="button" className="btn btn-ghost btn-sm">
        🙂
      </button>
      <div className="flex-1">
        <textarea
          className="textarea textarea-bordered w-full resize-none"
          rows={1}
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Send
      </button>
    </form>
  );
}
