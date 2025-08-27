import { Result } from "../types";
import Image from "next/image";
import { ContactDetailModal, useContactDetail } from "../../contact-detail";
import DefaultAvatar from "../common/DefaultAvatar";
type ChatHeaderProps = {
  chat?: Result;
  onBack?: () => void;
};

export default function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  const participants =
    chat?.room.participant.map((p) => ({
      ...p,
      displayName: p.role === 1 ? "You" : p.name,
    })) ?? [];

  const me = participants.find((p) => p.role === 1);
  const otherParticipants = participants.filter((p) => p.id !== me?.id);

  const isPersonalChat =
    participants.length === 2 && participants.some((p) => p.role === 1);

  const { isOpen, openContactDetail, closeContactDetail } = useContactDetail();

  const handleOpenDetail = () => {
    if (chat) {
      openContactDetail(chat);
    }
  };

  return (
    <>
      <div className="h-18 border-b border-base-300 flex items-center gap-3 px-4 bg-base-200">
        {onBack ? (
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={onBack}
            aria-label="Back"
          >
            ←
          </button>
        ) : null}

        <div className="avatar">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral text-neutral-content flex items-center justify-center">
            {chat?.room?.image_url ? (
              <Image
                src={chat.room.image_url}
                alt={chat.room.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <DefaultAvatar name={chat?.room?.name ?? ""} />
            )}
          </div>
        </div>

        <div
          className="flex flex-col flex-1 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors"
          onClick={handleOpenDetail}
        >
          <span className="font-medium">{chat?.room.name ?? "Pilih chat"}</span>
          <span className="text-xs opacity-70">
            {isPersonalChat
              ? "Select info for more detail"
              : `${otherParticipants.map((p) => p.displayName).join(", ")}${
                  me?.displayName ? `, ${me?.displayName}` : ""
                }`}
          </span>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {chat && (
        <ContactDetailModal
          contact={chat}
          isOpen={isOpen}
          onClose={closeContactDetail}
        />
      )}
    </>
  );
}
