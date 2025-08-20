"use client";
import { useEffect, useMemo, useState } from "react";

type ParticipantInput = {
  id: string;
  name: string;
  role: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function NewGroupModal({ open, onClose, onCreated }: Props) {
  // Step control
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: pick participants
  type Participant = { id: string; name: string; role: number };
  const [allContacts, setAllContacts] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Participant[]>([]);

  // Step 2: group info
  const [groupName, setGroupName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    // Load contacts
    (async () => {
      try {
        const res = await fetch("/api/chat/participant", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed loading contacts");
        const data: Participant[] = await res.json();
        setAllContacts(data);
      } catch (e) {
        // Silent fail; user can still type IDs manually on step 2 if needed
      }
    })();
  }, [open]);

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
      // reset state after animation
      setStep(1);
      setSelected([]);
      setGroupName("");
      setImageUrl("");
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
            <div className="p-4">
              <input
                className="input input-bordered w-full"
                placeholder="Search name or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

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
            <input
              className="input input-bordered"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

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
