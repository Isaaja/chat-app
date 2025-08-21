import { ContactInfoProps } from "../types";
import Image from "next/image";
import DefaultAvatar from "../../chat/common/DefaultAvatar";
export default function ContactInfo({ contact }: ContactInfoProps) {
  return (
    <div className="text-center space-y-4">
      {/* Avatar */}
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

      {/* Contact Details */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{contact.room.name}</h2>
        <p className="text-sm opacity-70">{contact.room.participant[1].id}</p>
        <p className="text-xs opacity-50">Your Contact</p>
      </div>
    </div>
  );
}
