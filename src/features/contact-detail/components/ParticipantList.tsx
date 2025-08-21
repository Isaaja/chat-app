import { ParticipantListProps } from "../types";
import DefaultAvatar from "@/features/chat/common/DefaultAvatar";
export default function ParticipantList({
  participants,
}: ParticipantListProps) {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
        >
          <DefaultAvatar name={participant.name} />

          {/* Participant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{participant.name}</span>
              {participant.role === 0 && (
                <span className="badge badge-secondary badge-xs">Admin</span>
              )}
              {participant.role === 1 && (
                <span className="badge badge-primary badge-xs">You</span>
              )}
            </div>
            <p className="text-xs opacity-70 truncate">{participant.id}</p>
          </div>

          {/* Role Badge */}
          <div className="text-xs opacity-50">
            {participant.role === 0
              ? "Admin"
              : participant.role === 1
              ? "You"
              : participant.role === 2
              ? "Member"
              : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
