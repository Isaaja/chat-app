"use client";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function NewContactModal({ open, onClose, onCreated }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(undefined);

      const res = await fetch("/api/chat/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, role }),
      });
      if (!res.ok) throw new Error("Failed to create contact");

      onCreated?.();
      onClose();
      setId("");
      setName("");
      setRole(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create contact");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-base-100 rounded-xl p-4 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Create New Contact</h2>

        <div className="flex flex-col gap-3">
          <input
            className="input input-bordered"
            placeholder="User ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            className="input input-bordered"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            className="input input-bordered"
            placeholder="Role (number)"
            value={role}
            onChange={(e) => setRole(Number(e.target.value))}
          />

          {error && <div className="text-error text-sm">{error}</div>}

          <div className="mt-4 flex justify-end gap-2">
            <button className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !id || !name}
            >
              {submitting ? "Creating..." : "Create Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
