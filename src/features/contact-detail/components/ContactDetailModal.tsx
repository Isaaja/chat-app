"use client";
import { ContactDetailProps } from "../types";
import ContactInfo from "./ContactInfo";
import GroupInfo from "./GroupInfo";
import { useEffect } from "react";

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
}: ContactDetailProps) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isGroup = contact.room.participant.length > 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 bg-base-300 rounded-lg w-11/12 max-w-2xl p-6 shadow-lg">
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
        </div>
      </div>
    </div>
  );
}
