import { useState } from "react";
import { Result } from "../../chat/types";

export function useContactDetail() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Result | null>(null);

  const openContactDetail = (contact: Result) => {
    setSelectedContact(contact);
    setIsOpen(true);
  };

  const closeContactDetail = () => {
    setIsOpen(false);
    setSelectedContact(null);
  };

  const handleAction = (action: string) => {
    console.log("Action:", action, "for contact:", selectedContact?.room.name);

    switch (action) {
      case "search":
        break;
      case "mute":
        break;
      case "block":
        break;
      case "delete":
        break;
      case "add-participant":
        break;
      case "leave-group":
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  return {
    isOpen,
    selectedContact,
    openContactDetail,
    closeContactDetail,
    handleAction,
  };
}
