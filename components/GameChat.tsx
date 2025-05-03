"use client";

import { useState, useEffect, useRef, useContext, FormEvent } from "react";
import { GameContext } from "@/context/GameContext";
import { getSocket } from "@/lib/socket"; // You missed this import
import type { Socket } from "socket.io-client";

// --- Types ---
interface ChatMessage {
  username: string;
  message: string;
}

export default function GameChat() {
  const { gameState } = useContext(GameContext);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      socket.current = getSocket();

      if (socket.current) {
        socket.current.on("chatMessage", (data: ChatMessage) => {
          setChatMessages((prev) => [...prev, data]);
        });
      }

      return () => {
        socket.current?.off("chatMessage");
      };
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (
      !message.trim() ||
      !gameState.code ||
      !gameState.currentPlayer ||
      !socket.current
    )
      return;

    socket.current.emit("sendChatMessage", {
      sessionCode: gameState.code,
      username: gameState.currentPlayer.username,
      message: message.trim(),
    });

    setMessage("");
  };

  return (
    <div className="card h-96 flex flex-col">
      <h3 className="font-semibold mb-3">Game Chat</h3>

      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg"
      >
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 h-full flex items-center justify-center">
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.username === gameState.currentPlayer?.username
                    ? "bg-blue-100 text-blue-800 ml-8"
                    : "bg-gray-200 mr-8"
                }`}
              >
                <div className="text-xs font-medium mb-1">{msg.username}</div>
                <div>{msg.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input flex-grow"
          placeholder="Type a message..."
          disabled={!gameState.joined || gameState.status === "completed"}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!gameState.joined || gameState.status === "completed"}
        >
          Send
        </button>
      </form>
    </div>
  );
}
