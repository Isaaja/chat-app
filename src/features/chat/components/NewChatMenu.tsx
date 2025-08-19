"use client";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, UsersRound } from "lucide-react";

type Props = {
  isOpen: boolean;
};

export default function NewChatMenu({ isOpen }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-16 right-4 sm:right-1/2 sm:translate-x-1/2 bg-base-100 rounded-xl z-10 w-56 p-3 shadow-lg"
        >
          <h1 className="text-lg font-bold text-center mb-2">New Chat</h1>

          <li>
            <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
              <UsersRound className="w-6 h-6 text-primary" />
              <span className="font-medium">New Group</span>
            </a>
          </li>

          <li>
            <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
              <UserRound className="w-6 h-6 text-primary" />
              <span className="font-medium">New Contact</span>
            </a>
          </li>
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
