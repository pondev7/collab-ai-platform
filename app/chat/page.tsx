"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! Upload documents and ask me anything about them.",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "This is a placeholder response. RAG coming soon.",
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 text-lg font-semibold">
        Collaborative AI Workspace
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xl rounded-lg px-4 py-2 ${
              msg.role === "user"
                ? "ml-auto bg-blue-600"
                : "mr-auto bg-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </main>

      {/* Input */}
      <footer className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask something..."
            className="flex-1 rounded-md bg-gray-900 px-3 py-2 outline-none"
          />
          <button
            onClick={sendMessage}
            className="rounded-md bg-blue-600 px-4 py-2"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
