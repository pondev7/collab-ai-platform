"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

type Message = {
  role: "user" | "assistant";
  kind: "text" | "file";
  content?: string;
  fileName?: string;
  fileType?: string;
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
        kind: "text",
        content: "Hi! Upload documents and ask me anything about them.",
      },
    ],
    "space-2": [
      {
        role: "assistant",
        kind: "text",
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
          kind: "text",
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
          kind: "text",
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
  const [filesByContext, setFilesByContext] = useState<Record<string, File[]>>({
    "personal:thread-1": [],
    "personal:thread-2": [],
    "space-1": [],
    "space-2": [],
  });
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
    setFilesByContext((prev) => ({
      ...prev,
      [`personal:${newThreadId}`]: [],
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
      setFilesByContext((inputs) => ({
        ...inputs,
        [`personal:${fallbackId}`]: [],
      }));
      return [fallbackThread];
    });

    setInputByContext((prev) => {
      const { [`personal:${threadId}`]: _removed, ...rest } = prev;
      return rest;
    });
    setFilesByContext((prev) => {
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
  const activeFiles = filesByContext[activeInputKey] ?? [];
  const inputPlaceholder =
    activeContext === "personal"
      ? "Ask in this thread..."
      : `Ask in ${spaces.find((space) => space.id === activeContext)?.name ?? "space"}...`;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, [activeInput]);

  useEffect(() => {
    setIsUploadMenuOpen(false);
  }, [activeInputKey]);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nextFiles = Array.from(files);
    setFilesByContext((prev) => ({
      ...prev,
      [activeInputKey]: [...(prev[activeInputKey] ?? []), ...nextFiles],
    }));
  };

  const removeFileAtIndex = (index: number) => {
    setFilesByContext((prev) => ({
      ...prev,
      [activeInputKey]: (prev[activeInputKey] ?? []).filter(
        (_file, idx) => idx !== index
      ),
    }));
  };

  const getFileLabel = (fileName: string, fileType: string) => {
    const type = fileType.split("/")[1]?.toUpperCase();
    if (type) return type;
    const extension = fileName.split(".").pop();
    return extension ? extension.toUpperCase() : "FILE";
  };

  const sendMessage = () => {
    if (!activeInput.trim() && activeFiles.length === 0) return;

    const fileMessages: Message[] = activeFiles.map((file) => ({
      role: "user",
      kind: "file",
      fileName: file.name,
      fileType: file.type || "Unknown type",
    }));
    const textMessage: Message | null = activeInput.trim()
      ? { role: "user", kind: "text", content: activeInput }
      : null;
    const newMessages = textMessage
      ? [...fileMessages, textMessage]
      : fileMessages;

    if (activeContext === "personal") {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeThreadId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  ...newMessages,
                  {
                    role: "assistant",
                    kind: "text",
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
          ...newMessages,
          {
            role: "assistant",
            kind: "text",
            content: `(${activeContext}) Placeholder response. RAG coming soon.`,
          },
        ],
      }));
    }

    setInputByContext((prev) => ({
      ...prev,
      [activeInputKey]: "",
    }));
    setFilesByContext((prev) => ({
      ...prev,
      [activeInputKey]: [],
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
              {msg.kind === "file" ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/60 text-xs font-semibold text-white">
                    {getFileLabel(msg.fileName ?? "file", msg.fileType ?? "")}
                  </div>
                  <div className="flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {msg.fileName}
                    </div>
                    <div className="text-xs text-blue-100/80">
                      {msg.fileType}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          ))}
        </main>

        {/* Input */}
        <footer className="border-t border-gray-800 p-4">
          <div className="flex flex-col gap-3">
            {activeFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-xs text-gray-200"
                  >
                    <span className="max-w-[180px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFileAtIndex(index)}
                      className="text-gray-400 hover:text-white"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUploadMenuOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-lg text-gray-300 transition hover:border-gray-500 hover:text-white"
                  aria-label="Add files"
                >
                  +
                </button>
                {isUploadMenuOpen && (
                  <div className="absolute bottom-12 left-0 z-10 w-40 rounded-lg border border-gray-800 bg-gray-900 p-1 text-sm shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-gray-200 hover:bg-gray-800"
                    >
                      Upload file
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadMenuOpen(false);
                        photoInputRef.current?.click();
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-gray-200 hover:bg-gray-800"
                    >
                      Upload photo
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    if (event.target) event.target.value = "";
                  }}
                  className="hidden"
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    if (event.target) event.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              <textarea
                ref={inputRef}
                value={activeInput}
                onChange={(e) =>
                  setInputByContext((prev) => ({
                    ...prev,
                    [activeInputKey]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={inputPlaceholder}
                rows={1}
                className="flex-1 resize-none rounded-md bg-gray-900 px-3 py-2 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!activeInput.trim() && activeFiles.length === 0}
                className="self-end rounded-md bg-blue-600 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
