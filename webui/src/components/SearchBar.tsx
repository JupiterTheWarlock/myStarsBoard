interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-term-surface px-3 py-2 border border-term-border">
      <span className="text-term-accent font-bold text-lg leading-none select-none">{'>'}</span>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search repos..."
        className="term-input flex-1 text-term-text text-sm placeholder-term-dim"
        spellCheck={false}
        autoComplete="off"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          className="text-term-dim hover:text-term-muted text-xs transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
