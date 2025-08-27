import { GroupInfoProps } from "../types";
import Image from "next/image";
import ParticipantList from "./ParticipantList";
import DefaultAvatar from "@/features/chat/common/DefaultAvatar";
export default function GroupInfo({ contact }: GroupInfoProps) {
  return (
    <div className="text-center space-y-4">
      {/* Group Avatar */}
      <div className="avatar w-28 h-28">
        {contact.room.image_url ? (
          <Image
            src={contact.room.image_url}
            alt={contact.room.name}
            width={96}
            height={96}
            className="rounded-full"
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

      {/* Participants List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-left">Participants</h3>
        <ParticipantList participants={contact.room.participant} />
      </div>
    </div>
  );
}
