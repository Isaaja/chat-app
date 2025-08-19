import { ContactInfoProps } from "../types";
import Image from "next/image";

export default function ContactInfo({ contact }: ContactInfoProps) {
  const participant = contact.room.participant[0]; // For individual chat, take first participant

  return (
    <div className="text-center space-y-4">
      {/* Avatar */}
      <div className="avatar">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral text-neutral-content flex items-center justify-center">
          {contact.room.image_url ? (
            <Image
              src={contact.room.image_url}
              alt={contact.room.name}
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold">
              {contact.room.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{contact.room.name}</h2>
        <p className="text-sm opacity-70">{participant?.id}</p>
        <p className="text-xs opacity-50">
          {participant?.role === 1 ? "You" : "Contact"}
        </p>
      </div>

      {/* Stats */}
      <div className="stats stats-horizontal shadow">
        <div className="stat">
          <div className="stat-title">Messages</div>
          <div className="stat-value text-primary">
            {contact.comments.length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Participants</div>
          <div className="stat-value text-secondary">
            {contact.room.participant.length}
          </div>
        </div>
      </div>
    </div>
  );
}
