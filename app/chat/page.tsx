"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Space = {
  id: string;
  name: string;
};

export default function ChatPage() {
  const [activeContext, setActiveContext] = useState("personal");

  const [spaces] = useState<Space[]>([
    { id: "space-1", name: "AI Research" },
    { id: "space-2", name: "Docs" },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! Upload documents and ask me anything about them.",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: `(${activeContext}) Placeholder response. RAG coming soon.`,
      },
    ]);

    setInput("");
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        activeContext={activeContext}
        spaces={spaces}
        onSelect={setActiveContext}
      />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-gray-800 p-4 text-lg font-semibold">
          {activeContext === "personal"
            ? "Personal Chat"
            : `Space: ${spaces.find((s) => s.id === activeContext)?.name}`}
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
    </div>
  );
}
