"use client";

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
};

export default function Sidebar({
  activeContext,
  spaces,
  threads,
  activeThreadId,
  onSelect,
  onSelectThread,
}: SidebarProps) {
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
        <div className="px-3 text-xs uppercase tracking-wide text-gray-500 mb-2">
          Threads
        </div>
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => {
              onSelect("personal");
              onSelectThread(thread.id);
            }}
            className={`cursor-pointer rounded-md px-3 py-2 mb-1 text-sm ${
              activeContext === "personal" && activeThreadId === thread.id
                ? "bg-gray-800"
                : "hover:bg-gray-800"
            }`}
          >
            {thread.title}
          </div>
        ))}
      </div>
    </aside>
  );
}
