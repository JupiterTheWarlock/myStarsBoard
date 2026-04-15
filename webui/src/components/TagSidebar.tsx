interface TagItem {
  name: string;
  count: number;
}

interface TagSidebarProps {
  tags: TagItem[];
  totalCount: number;
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

function TagSidebar({ tags, totalCount, selectedTag, onSelect }: TagSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-term-border overflow-y-auto">
      <nav className="py-3 px-2">
        {/* All option */}
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-2 py-1.5 text-sm flex items-center transition-colors ${
            selectedTag === null
              ? 'text-term-accent-bright bg-term-accent-dim/40'
              : 'text-term-muted hover:text-term-text hover:bg-term-surface'
          }`}
        >
          <span className="w-4 shrink-0 select-none">
            {selectedTag === null ? '▸' : ' '}
          </span>
          <span className="font-bold flex-1">all</span>
          <span className="text-xs tabular-nums opacity-70">{totalCount}</span>
        </button>

        <div className="my-2 mx-2 border-b border-term-border/40" />

        {/* Tag list */}
        <div className="space-y-px">
          {tags.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`w-full text-left px-2 py-1.5 text-sm flex items-center transition-colors ${
                selectedTag === name
                  ? 'text-term-accent-bright bg-term-accent-dim/40'
                  : 'text-term-muted hover:text-term-text hover:bg-term-surface'
              }`}
            >
              <span className="w-4 shrink-0 select-none">
                {selectedTag === name ? '▸' : ' '}
              </span>
              <span className="flex-1 truncate">{name}</span>
              <span className="text-xs tabular-nums opacity-70 ml-1">{count}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default TagSidebar;
