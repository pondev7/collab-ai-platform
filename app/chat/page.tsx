"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Thread = {
  id: string;
  title: string;
  messages: Message[];
};

type Space = {
  id: string;
  name: string;
};

type SpaceMessages = Record<string, Message[]>;

export default function ChatPage() {
  const [activeContext, setActiveContext] = useState("personal");

  const [spaces] = useState<Space[]>([
    { id: "space-1", name: "AI Research" },
    { id: "space-2", name: "Docs" },
  ]);
  const [spaceMessages, setSpaceMessages] = useState<SpaceMessages>({
    "space-1": [
      {
        role: "assistant",
        content: "Hi! Upload documents and ask me anything about them.",
      },
    ],
    "space-2": [
      {
        role: "assistant",
        content: "Hi! Upload documents and ask me anything about them.",
      },
    ],
  });

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread-1",
      title: "New chat",
      messages: [
        {
          role: "assistant",
          content: "Hi! Upload documents and ask me anything about them.",
        },
      ],
    },
    {
      id: "thread-2",
      title: "Project notes",
      messages: [
        {
          role: "assistant",
          content: "Ask me to summarize your latest updates.",
        },
      ],
    },
  ]);
  const [activeThreadId, setActiveThreadId] = useState("thread-1");

  const [inputByContext, setInputByContext] = useState<Record<string, string>>({
    "personal:thread-1": "",
    "personal:thread-2": "",
    "space-1": "",
    "space-2": "",
  });

  const handleNewThread = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newThreadId,
      title: "New chat",
      messages: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveContext("personal");
    setActiveThreadId(newThreadId);
    setInputByContext((prev) => ({
      ...prev,
      [`personal:${newThreadId}`]: "",
    }));
  };

  const handleRenameThread = (threadId: string, title: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, title } : thread
      )
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => {
      const remainingThreads = prev.filter((thread) => thread.id !== threadId);
      const nextActive =
        activeThreadId === threadId ? remainingThreads[0] : null;

      if (nextActive) {
        setActiveContext("personal");
        setActiveThreadId(nextActive.id);
        return remainingThreads;
      }

      if (remainingThreads.length > 0) {
        return remainingThreads;
      }

      const fallbackId = `thread-${Date.now()}`;
      const fallbackThread: Thread = {
        id: fallbackId,
        title: "New chat",
        messages: [],
      };
      setActiveContext("personal");
      setActiveThreadId(fallbackId);
      setInputByContext((inputs) => ({
        ...inputs,
        [`personal:${fallbackId}`]: "",
      }));
      return [fallbackThread];
    });

    setInputByContext((prev) => {
      const { [`personal:${threadId}`]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const activeMessages =
    activeContext === "personal"
      ? activeThread?.messages ?? []
      : spaceMessages[activeContext] ?? [];
  const activeInputKey =
    activeContext === "personal"
      ? `personal:${activeThread?.id ?? "thread-1"}`
      : activeContext;
  const activeInput = inputByContext[activeInputKey] ?? "";
  const inputPlaceholder =
    activeContext === "personal"
      ? "Ask in this thread..."
      : `Ask in ${spaces.find((space) => space.id === activeContext)?.name ?? "space"}...`;

  const sendMessage = () => {
    if (!activeInput.trim()) return;
    if (activeContext === "personal") {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeThreadId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  { role: "user", content: activeInput },
                  {
                    role: "assistant",
                    content: `(${activeContext}) Placeholder response. RAG coming soon.`,
                  },
                ],
              }
            : thread
        )
      );
    } else {
      setSpaceMessages((prev) => ({
        ...prev,
        [activeContext]: [
          ...(prev[activeContext] ?? []),
          { role: "user", content: activeInput },
          {
            role: "assistant",
            content: `(${activeContext}) Placeholder response. RAG coming soon.`,
          },
        ],
      }));
    }

    setInputByContext((prev) => ({
      ...prev,
      [activeInputKey]: "",
    }));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        activeContext={activeContext}
        spaces={spaces}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={setActiveContext}
        onSelectThread={setActiveThreadId}
        onNewThread={handleNewThread}
        onRenameThread={handleRenameThread}
        onDeleteThread={handleDeleteThread}
      />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-gray-800 p-4 text-lg font-semibold">
          {activeContext === "personal"
            ? "ChatGPT"
            : `Space: ${spaces.find((s) => s.id === activeContext)?.name}`}
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeMessages.map((msg, idx) => (
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
              value={activeInput}
              onChange={(e) =>
                setInputByContext((prev) => ({
                  ...prev,
                  [activeInputKey]: e.target.value,
                }))
              }
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={inputPlaceholder}
              className="flex-1 rounded-md bg-gray-900 px-3 py-2 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!activeInput.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
