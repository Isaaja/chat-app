"use client";
import { useState } from "react";
import { Smile, Plus, SendHorizonal } from "lucide-react";

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
      className="border-t border-black p-3 flex items-end gap-2 bg-base-300 text-white"
    >
      <button className="btn btn-ghost btn-sm justify-center items-center h-full hidden md:block">
        <Smile className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm justify-center items-center h-full"
        aria-label="Add attachment"
      >
        <Plus className="w-5 h-5" />
      </button>
      <input
        type="text"
        placeholder="Type a message"
        className="input input-bordered flex-1 rounded-full bg-base-100"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
        aria-label="Message input"
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!text.trim()}
        aria-label="Send message"
      >
        <SendHorizonal />
      </button>
    </form>
  );
}
