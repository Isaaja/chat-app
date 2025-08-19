import { ParticipantListProps } from "../types";

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
          {/* Avatar */}
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
              <span className="text-sm font-medium">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Participant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{participant.name}</span>
              {participant.role === 1 && (
                <span className="badge badge-primary badge-xs">You</span>
              )}
              {participant.role === "admin" && (
                <span className="badge badge-secondary badge-xs">Admin</span>
              )}
            </div>
            <p className="text-xs opacity-70 truncate">{participant.id}</p>
          </div>

          {/* Role Badge */}
          <div className="text-xs opacity-50">
            {participant.role === 1
              ? "You"
              : participant.role === "admin"
              ? "Admin"
              : participant.role === "king customer"
              ? "VIP"
              : "Member"}
          </div>
        </div>
      ))}
    </div>
  );
}
