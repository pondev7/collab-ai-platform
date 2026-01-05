"use client";

import { useState } from "react";

type Space = {
  id: string;
  name: string;
};

type Thread = {
  id: string;
  title: string;
};

type SidebarProps = {
  activeContext: string;
  spaces: Space[];
  threads: Thread[];
  activeThreadId: string;
  onSelect: (id: string) => void;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onRenameThread: (id: string, title: string) => void;
  onDeleteThread: (id: string) => void;
};

export default function Sidebar({
  activeContext,
  spaces,
  threads,
  activeThreadId,
  onSelect,
  onSelectThread,
  onNewThread,
  onRenameThread,
  onDeleteThread,
}: SidebarProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const startEditingThread = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setDraftTitle(thread.title);
  };

  const commitEditingThread = () => {
    if (!editingThreadId) return;
    const nextTitle = draftTitle.trim() || "New chat";
    onRenameThread(editingThreadId, nextTitle);
    setEditingThreadId(null);
  };

  const cancelEditingThread = () => {
    setEditingThreadId(null);
    setDraftTitle("");
  };

  return (
    <aside className="w-64 bg-gray-900 text-white border-r border-gray-800 flex flex-col">
      <div className="p-4 text-lg font-semibold">AI Platform</div>

      {/* Spaces */}
      <div className="mt-4 px-2">
        <div className="px-3 text-sm text-gray-400 mb-2">Spaces</div>

        {spaces.map((space) => (
          <div
            key={space.id}
            onClick={() => onSelect(space.id)}
            className={`cursor-pointer rounded-md px-3 py-2 mb-1 ${
              activeContext === space.id ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            {space.name}
          </div>
        ))}
      </div>

      {/* Threads */}
      <div className="mt-6 px-2">
        <div className="flex items-center justify-between px-3 text-xs uppercase tracking-wide text-gray-500 mb-2">
          <span>Threads</span>
          <button
            type="button"
            onClick={onNewThread}
            className="rounded-md border border-gray-700 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-800"
          >
            New Thread
          </button>
        </div>
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => {
              onSelect("personal");
              onSelectThread(thread.id);
            }}
            onDoubleClick={() => startEditingThread(thread)}
            className={`group flex cursor-pointer items-center rounded-md px-3 py-2 mb-1 text-sm ${
              activeContext === "personal" && activeThreadId === thread.id
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex-1">
              {editingThreadId === thread.id ? (
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={commitEditingThread}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      commitEditingThread();
                    }
                    if (event.key === "Escape") {
                      cancelEditingThread();
                    }
                  }}
                  onClick={(event) => event.stopPropagation()}
                  autoFocus
                  className="w-full rounded-sm bg-gray-950 px-2 py-1 text-sm text-white outline-none"
                />
              ) : (
                thread.title
              )}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm("Delete this thread?")) {
                  onDeleteThread(thread.id);
                }
              }}
              className="ml-2 rounded px-2 py-1 text-xs text-gray-400 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
