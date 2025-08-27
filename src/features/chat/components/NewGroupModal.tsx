"use client";
import { useEffect, useMemo, useState } from "react";
import type { Participant as GlobalParticipant } from "../types";
import SearchInput from "../common/SearchInput";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  participants?: GlobalParticipant[];
};

export default function NewGroupModal({
  open,
  onClose,
  onCreated,
  participants,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  type Participant = { id: string; name: string; role: number };
  const [allContacts, setAllContacts] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Participant[]>([]);

  const [groupName, setGroupName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    if (participants && participants.length) {
      setAllContacts(participants);
    } else {
      setAllContacts([]);
    }
  }, [open, participants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [allContacts, query]);

  function toggleSelect(p: Participant) {
    setSelected((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      if (exists) return prev.filter((x) => x.id !== p.id);
      return [...prev, p];
    });
  }

  function removeChip(id: string) {
    setSelected((prev) => prev.filter((x) => x.id !== id));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(undefined);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(undefined);

      // Create a temporary message ID for upload
      const tempMessageId = Date.now().toString();

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "IMAGE");
      formData.append("messageId", tempMessageId);

      const response = await fetch("/api/chat/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const result = await response.json();
      setImageUrl(result.url);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "group-image-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate() {
    try {
      setSubmitting(true);
      setError(undefined);

      const participants = selected.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
      }));

      const res = await fetch("/api/chat/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, imageUrl, participants }),
      });
      if (!res.ok) throw new Error("Failed to create group");

      onCreated?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelected([]);
      setGroupName("");
      setImageUrl("");
      setSelectedFile(null);
      setQuery("");
      setError(undefined);
    }, 0);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-base-100 rounded-xl p-0 w-full max-w-lg shadow-xl overflow-hidden">
        {step === 1 ? (
          <div className="flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">New group</h2>
              <p className="text-sm opacity-70">Select participants</p>
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="px-4 pt-3 flex gap-2 flex-wrap">
                {selected.map((p) => (
                  <span key={p.id} className="badge badge-primary gap-2">
                    {p.name}
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => removeChip(p.id)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <SearchInput query={query} setQuery={setQuery} />

            {/* Contact list */}
            <div className="max-h-[50vh] overflow-y-auto">
              {filtered.map((p) => {
                const active = selected.some((x) => x.id === p.id);
                return (
                  <button
                    key={p.id}
                    className={`w-full p-3 text-left hover:bg-base-200 flex items-center justify-between ${
                      active ? "bg-base-200" : ""
                    }`}
                    onClick={() => toggleSelect(p)}
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs opacity-60">{p.id}</div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={active}
                      readOnly
                    />
                  </button>
                );
              })}
            </div>

            <div className="p-4 flex justify-between border-t">
              <button className="btn" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={selected.length === 0}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-3">
            <h2 className="text-lg font-semibold">New group</h2>
            <p className="text-sm opacity-70">Add subject</p>
            <input
              className="input input-bordered"
              placeholder="Group subject"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Group Image (Optional)
              </label>

              <div className="flex gap-2 items-start w-56">
                <label className="input input-bordered flex-1 cursor-pointer">
                  <svg
                    className="h-[1em] opacity-50"
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </g>
                  </svg>
                  <input
                    id="group-image-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <span className="grow text-sm opacity-70 truncate">
                    {selectedFile ? selectedFile.name : "Choose image file..."}
                  </span>
                </label>

                {selectedFile && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleFileUpload}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                )}
              </div>

              {imageUrl && (
                <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-success">
                    Image uploaded successfully!
                  </span>
                </div>
              )}
            </div>

            {error && <div className="text-error text-sm">{error}</div>}

            <div className="mt-2 flex justify-between">
              <button
                className="btn"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={submitting || !groupName}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
