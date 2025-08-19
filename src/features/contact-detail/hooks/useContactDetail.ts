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

    // Handle different actions
    switch (action) {
      case "search":
        // Implement search functionality
        break;
      case "mute":
        // Implement mute functionality
        break;
      case "block":
        // Implement block functionality
        break;
      case "delete":
        // Implement delete functionality
        break;
      case "add-participant":
        // Implement add participant functionality
        break;
      case "leave-group":
        // Implement leave group functionality
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
