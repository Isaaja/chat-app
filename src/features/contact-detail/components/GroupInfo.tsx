import { GroupInfoProps } from "../types";
import Image from "next/image";
import ParticipantList from "./ParticipantList";
import DefaultAvatar from "@/features/chat/common/DefaultAvatar";
export default function GroupInfo({ contact }: GroupInfoProps) {
  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="text-center space-y-4">
        {/* Group Avatar */}
        <div className="avatar">
          {contact.room.image_url ? (
            <Image
              src={contact.room.image_url}
              alt={contact.room.name}
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          ) : (
            <DefaultAvatar name={contact.room.name} inModal={true} />
          )}
        </div>

        {/* Group Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{contact.room.name}</h2>
          <p className="text-sm opacity-70">
            {contact.room.participant.length} participants
          </p>
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
