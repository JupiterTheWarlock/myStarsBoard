interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  semantic: boolean;
  onToggleSemantic: () => void;
  loading?: boolean;
  topK?: number;
  matchedCount?: number;
  onTopKChange?: (k: number) => void;
}

function SearchBar({ query, onChange, semantic, onToggleSemantic, loading, topK, matchedCount, onTopKChange }: SearchBarProps) {
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
        className={`text-xs px-1.5 py-0.5 border transition-colors shrink-0 ${
          semantic
            ? 'border-term-accent text-term-accent-bright bg-term-accent-dim'
            : 'border-term-border text-term-dim hover:text-term-muted'
        }`}
        title={semantic ? 'Semantic search ON' : 'Keyword search'}
      >
        {semantic ? 'SEM' : 'KW'}
      </button>
      {semantic && matchedCount !== undefined && matchedCount > 0 && topK !== undefined && onTopKChange && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-term-dim text-xs">top</span>
          <input
            type="number"
            min={1}
            max={matchedCount}
            value={topK}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1) onTopKChange(Math.min(v, matchedCount));
            }}
            className="w-12 text-center text-term-text text-xs bg-term-bg border border-term-border px-1 py-0.5 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-term-dim text-xs">/ {matchedCount}</span>
        </div>
      )}
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
