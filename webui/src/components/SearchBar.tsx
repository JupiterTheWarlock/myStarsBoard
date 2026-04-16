interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  semantic: boolean;
  onToggleSemantic: () => void;
  loading?: boolean;
}

function SearchBar({ query, onChange, semantic, onToggleSemantic, loading }: SearchBarProps) {
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
      {loading && (
        <span className="text-term-accent text-xs animate-pulse">...</span>
      )}
      <button
        onClick={onToggleSemantic}
        className={`text-xs px-1.5 py-0.5 border transition-colors ${
          semantic
            ? 'border-term-accent text-term-accent-bright bg-term-accent-dim'
            : 'border-term-border text-term-dim hover:text-term-muted'
        }`}
        title={semantic ? 'Semantic search ON' : 'Keyword search'}
      >
        {semantic ? 'SEM' : 'KW'}
      </button>
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
