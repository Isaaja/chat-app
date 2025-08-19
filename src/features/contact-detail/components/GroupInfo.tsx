import { GroupInfoProps } from "../types";
import Image from "next/image";
import ParticipantList from "./ParticipantList";

export default function GroupInfo({ contact }: GroupInfoProps) {
  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="text-center space-y-4">
        {/* Group Avatar */}
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

        {/* Group Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{contact.room.name}</h2>
          <p className="text-sm opacity-70">
            {contact.room.participant.length} participants
          </p>
        </div>

        {/* Group Stats */}
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

      {/* Participants List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Participants</h3>
        <ParticipantList participants={contact.room.participant} />
      </div>
    </div>
  );
}
