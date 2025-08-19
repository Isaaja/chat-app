"use client";
import { ContactDetailProps } from "../types";
import ContactInfo from "./ContactInfo";
import GroupInfo from "./GroupInfo";
import ContactActions from "./ContactActions";

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
}: ContactDetailProps) {
  if (!isOpen) return null;

  const isGroup = contact.room.participant.length > 2;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Detail Kontak</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {isGroup ? (
            <GroupInfo contact={contact} />
          ) : (
            <ContactInfo contact={contact} />
          )}

          <ContactActions
            contact={contact}
            onAction={(action) => {
              console.log("Action:", action);
              // Handle actions like block, delete, etc.
            }}
          />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
