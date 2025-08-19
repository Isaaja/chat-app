import { Result } from "../chat/types";

export interface ContactDetailProps {
  contact: Result;
  isOpen: boolean;
  onClose: () => void;
}

export interface ContactInfoProps {
  contact: Result;
}

export interface GroupInfoProps {
  contact: Result;
}

export interface ParticipantListProps {
  participants: Result["room"]["participant"];
}

export interface ContactActionsProps {
  contact: Result;
  onAction: (action: string) => void;
}
