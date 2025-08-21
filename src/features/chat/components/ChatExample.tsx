"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatExample() {
  const {
    messages,
    rooms,
    loading,
    error,
    sendMessageToRoom,
    sendPersonalChat,
    loadRoomMessages,
    loadPersonalMessages,
    createNewGroup,
    clearError,
  } = useChat();

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [senderId, setSenderId] = useState("user1");
  const [receiverId, setReceiverId] = useState("user2");
  const [isPersonalChat, setIsPersonalChat] = useState(false);

  // Load initial data
  useEffect(() => {
    // Create a test group if no rooms exist
    if (rooms.length === 0) {
      createNewGroup("Test Group", [
        { id: "user1", name: "John Doe", role: 1 },
        { id: "user2", name: "Jane Smith", role: 1 },
      ]);
    }
  }, [rooms.length, createNewGroup]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      if (isPersonalChat) {
        await sendPersonalChat(senderId, receiverId, messageInput);
      } else if (selectedRoomId) {
        await sendMessageToRoom(selectedRoomId, senderId, messageInput);
      }
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleLoadRoomMessages = async (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsPersonalChat(false);
    await loadRoomMessages(roomId);
  };

  const handleLoadPersonalMessages = async () => {
    setSelectedRoomId(null);
    setIsPersonalChat(true);
    await loadPersonalMessages(senderId, receiverId);
  };

  const handleCreateGroup = async () => {
    const groupName = prompt("Enter group name:");
    if (groupName) {
      await createNewGroup(groupName, [
        { id: "user1", name: "John Doe", role: 1 },
        { id: "user2", name: "Jane Smith", role: 1 },
        { id: "user3", name: "Bob Johnson", role: 1 },
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chat API Example</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Rooms and Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>

            {/* User Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Sender ID:
              </label>
              <input
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Personal Chat Controls */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Receiver ID:
              </label>
              <input
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleLoadPersonalMessages}
                className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Load Personal Chat
              </button>
            </div>

            {/* Create Group */}
            <div className="mb-4">
              <button
                onClick={handleCreateGroup}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Create New Group
              </button>
            </div>

            {/* Rooms List */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Rooms</h3>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleLoadRoomMessages(room.id)}
                    className={`w-full text-left p-2 rounded ${
                      selectedRoomId === room.id
                        ? "bg-blue-100 border-blue-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-gray-600">
                      {room.participant.length} participants
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                {isPersonalChat
                  ? `Personal Chat: ${senderId} ↔ ${receiverId}`
                  : selectedRoomId
                  ? `Room: ${
                      rooms.find((r) => r.id === selectedRoomId)?.name ||
                      "Unknown"
                    }`
                  : "Select a room or start personal chat"}
              </h2>
              {loading && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === senderId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                          message.sender.id === senderId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.sender.name}
                        </div>
                        <div className="text-sm">{message.message}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender.id === senderId
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !messageInput.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
