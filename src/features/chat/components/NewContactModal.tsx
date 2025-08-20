"use client";
import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
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
      <div className="bg-base-100 rounded-xl p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-6 text-center">New Contact</h2>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
            <UserRound className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Email</h3>
            <label className="input validator flex items-center gap-2">
              <svg
                className="h-5 w-5 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </g>
              </svg>
              <input
                type="email"
                placeholder="mail@site.com"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full"
              />
            </label>
            <p className="validator-hint text-xs text-gray-500">
              Enter a valid email address
            </p>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <h3 className="text-sm font-medium">Name</h3>
            <label className="input validator flex items-center gap-2">
              <svg
                className="h-5 w-5 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </g>
              </svg>
              <input
                type="text"
                required
                placeholder="Username"
                pattern="[A-Za-z][A-Za-z0-9\-]*"
                title="Only letters, numbers or dash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </label>
            <p className="validator-hint text-xs text-gray-500">
              Must be 3 to 30 characters <br />
              containing only letters, numbers or dash
            </p>
          </div>
        </div>

        {error && <div className="text-error text-sm mt-2">{error}</div>}

        {/* Footer */}
        <div className="mt-2 border-t-white w-full pt-4 flex justify-between gap-4">
          <button
            className="btn btn-primary flex-1"
            onClick={handleSubmit}
            disabled={submitting || !id || !name}
          >
            Save
          </button>
          <button
            className="btn flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
