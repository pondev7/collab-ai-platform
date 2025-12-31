"use client";

type Space = {
  id: string;
  name: string;
};

type SidebarProps = {
  activeContext: string;
  spaces: Space[];
  onSelect: (id: string) => void;
};

export default function Sidebar({
  activeContext,
  spaces,
  onSelect,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white border-r border-gray-800 flex flex-col">
      <div className="p-4 text-lg font-semibold">AI Platform</div>

      {/* Personal */}
      <div className="px-2">
        <div
          onClick={() => onSelect("personal")}
          className={`cursor-pointer rounded-md px-3 py-2 ${
            activeContext === "personal" ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          Personal
        </div>
      </div>

      {/* Spaces */}
      <div className="mt-6 px-2">
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
    </aside>
  );
}
