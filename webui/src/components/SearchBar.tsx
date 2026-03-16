interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

function SearchBar({ query, onChange, onExpandAll, onCollapseAll }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search repositories, descriptions, languages..."
          className="w-full px-4 py-2 pl-10 bg-github-dark border border-github-border rounded-md text-github-text placeholder-gray-500 focus:outline-none focus:border-github-accent transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onExpandAll}
          className="px-4 py-2 bg-github-dark border border-github-border rounded-md text-github-text hover:bg-github-border transition-colors text-sm"
        >
          Expand All
        </button>
        <button
          onClick={onCollapseAll}
          className="px-4 py-2 bg-github-dark border border-github-border rounded-md text-github-text hover:bg-github-border transition-colors text-sm"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
