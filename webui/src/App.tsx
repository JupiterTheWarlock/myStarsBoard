import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';
import TagSidebar from './components/TagSidebar';
import RepoCard from './components/RepoCard';
import { STARSBOARD_EMBEDDINGS } from './embeddings';

interface Star {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  url: string;
  stars: number;
  updatedAt: string;
  tags?: string[];
}

interface StarsByTag {
  [tag: string]: Star[];
}

interface AppProps {
  initialData: StarsByTag;
  title: string;
  favicon: string;
  icon: string;
  iconUrl: string;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

const hasEmbeddings = Object.keys(STARSBOARD_EMBEDDINGS).length > 0;

function App({ initialData, title, favicon, icon, iconUrl }: AppProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticMode, setSemanticMode] = useState(false);
  const [semanticResults, setSemanticResults] = useState<Map<number, number> | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [topK, setTopK] = useState(20);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isIconUrl = icon && (icon.startsWith('http') || icon.startsWith('/'));
  const displayIcon = icon && !isIconUrl && icon.length <= 4 ? icon : '';

  useEffect(() => {
    document.title = `${displayIcon || '★'} ${title}`;
  }, [title, displayIcon]);

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    // Detect MIME type from URL/data URI
    if (favicon.startsWith('data:image/svg+xml')) {
      link.type = 'image/svg+xml';
    } else if (favicon.startsWith('data:image/png')) {
      link.type = 'image/png';
    } else if (favicon.startsWith('data:image/') || /\.(jpe?g|jfif)$/i.test(favicon)) {
      link.type = 'image/jpeg';
    } else if (/\.png$/i.test(favicon)) {
      link.type = 'image/png';
    } else if (/\.ico$/i.test(favicon)) {
      link.type = 'image/x-icon';
    } else if (/\.gif$/i.test(favicon)) {
      link.type = 'image/gif';
    } else {
      link.type = 'image/svg+xml';
    }
    link.href = favicon;
  }, [favicon]);

  const tags = useMemo(() => {
    return Object.entries(initialData)
      .map(([name, repos]) => ({ name, count: repos.length }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialData]);

  const totalRepos = useMemo(() => {
    const allRepos = Object.values(initialData).flat();
    const seen = new Set<number>();
    return allRepos.filter(repo => {
      if (seen.has(repo.id)) return false;
      seen.add(repo.id);
      return true;
    }).length;
  }, [initialData]);

  // Semantic search: debounce query, call API, compute similarities
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSemanticResults(null);

    if (!semanticMode || !query.trim() || !hasEmbeddings) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSemanticLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[semantic] API error:', res.status, errorText);
          throw new Error(`embed API ${res.status}: ${errorText}`);
        }
        const { embedding } = await res.json();

        const scores = new Map<number, number>();
        for (const [id, emb] of Object.entries(STARSBOARD_EMBEDDINGS)) {
          const sim = cosineSimilarity(embedding, emb);
          if (sim > 0.6) scores.set(Number(id), sim);
        }
        console.log(`[semantic] query="${query}" matched ${scores.size} repos`);
        setSemanticResults(scores);
      } catch (err) {
        console.error('[semantic] failed:', (err as Error).message);
      } finally {
        setSemanticLoading(false);
      }
    }, 400);
  }, [semanticMode]);

  const toggleSemantic = useCallback(() => {
    setSemanticMode(prev => {
      if (prev) setSemanticResults(null);
      return !prev;
    });
  }, []);

  const displayedRepos = useMemo(() => {
    let repos: Star[];

    if (selectedTag && initialData[selectedTag]) {
      repos = [...initialData[selectedTag]];
    } else {
      repos = Object.values(initialData).flat();
      // Deduplicate (a repo can appear under multiple tags)
      const seen = new Set<number>();
      repos = repos.filter(repo => {
        if (seen.has(repo.id)) return false;
        seen.add(repo.id);
        return true;
      });
    }

    // Sort by stars descending
    repos.sort((a, b) => b.stars - a.stars);

    if (!searchQuery.trim()) return repos;

    // Semantic search mode
    if (semanticMode && semanticResults) {
      return repos
        .filter(repo => semanticResults.has(repo.id))
        .sort((a, b) => (semanticResults.get(b.id) ?? 0) - (semanticResults.get(a.id) ?? 0))
        .slice(0, topK);
    }

    // Keyword search fallback (or default mode)
    const query = searchQuery.toLowerCase();
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.language?.toLowerCase().includes(query) ||
      repo.fullName.toLowerCase().includes(query)
    );
  }, [initialData, selectedTag, searchQuery, semanticMode, semanticResults, topK]);

  const currentTagCount = selectedTag && initialData[selectedTag]
    ? initialData[selectedTag].length
    : totalRepos;

  return (
    <div className="h-screen flex flex-col bg-term-bg font-terminal scanlines">
      {/* Header */}
      <header className="shrink-0 px-4 pt-4 pb-3 border-b border-term-border">
        <div className="max-w-[1600px] mx-auto flex items-baseline justify-between flex-wrap gap-x-4 gap-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            <a
              href={iconUrl || undefined}
              target={iconUrl ? '_blank' : undefined}
              rel={iconUrl ? 'noopener noreferrer' : undefined}
              className="text-term-accent glow-accent"
            >
              {isIconUrl
                ? <img src={icon} alt="" className="inline-block w-6 h-6 sm:w-7 sm:h-7 rounded-full align-middle" />
                : displayIcon || '★'}
            </a>{' '}
            <span className="text-term-text">{title}</span>
          </h1>
          <a
            href="https://github.com/JupiterTheWarlock/StarsBoard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-term-muted hover:text-term-accent transition-colors shrink-0"
            title="Template Repository"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
          <Stats totalStars={totalRepos} tagCount={tags.length} />
        </div>
        <div className="max-w-[1600px] mx-auto mt-3">
          <SearchBar
            query={searchQuery}
            onChange={handleSearchChange}
            semantic={semanticMode}
            onToggleSemantic={toggleSemantic}
            loading={semanticLoading}
            topK={topK}
            matchedCount={semanticResults?.size ?? 0}
            onTopKChange={setTopK}
          />
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <TagSidebar
          tags={tags}
          totalCount={totalRepos}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tag bar */}
          <div className="flex overflow-x-auto gap-1.5 px-4 py-3 md:hidden border-b border-term-border/50">
            <button
              onClick={() => setSelectedTag(null)}
              className={`shrink-0 px-2.5 py-1 text-xs border transition-colors ${
                selectedTag === null
                  ? 'border-term-accent text-term-accent-bright bg-term-accent-dim'
                  : 'border-term-border text-term-muted hover:text-term-text'
              }`}
            >
              all ({totalRepos})
            </button>
            {tags.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setSelectedTag(name)}
                className={`shrink-0 px-2.5 py-1 text-xs border transition-colors whitespace-nowrap ${
                  selectedTag === name
                    ? 'border-term-accent text-term-accent-bright bg-term-accent-dim'
                    : 'border-term-border text-term-muted hover:text-term-text'
                }`}
              >
                {name} ({count})
              </button>
            ))}
          </div>

          {/* Section header */}
          <div className="px-4 pt-4 pb-2 flex items-baseline gap-2">
            <span className="text-term-text font-bold text-sm">
              {selectedTag || 'all'}
            </span>
            <span className="text-term-dim text-xs">
              {searchQuery && displayedRepos.length !== currentTagCount
                ? `${displayedRepos.length}/${currentTagCount}`
                : `${currentTagCount} repos`}
            </span>
          </div>
          <div className="px-4">
            <div className="border-b border-term-border/50" />
          </div>

          {/* Card grid */}
          <div className="p-4">
            {displayedRepos.length === 0 ? (
              <div className="py-12 text-center">
                <span className="text-term-muted text-sm">
                  {'>'} no matches for "<span className="text-term-accent">{searchQuery}</span>"
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {displayedRepos.map((repo, index) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    animationDelay={Math.min(index * 20, 400)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="px-4 py-4 mt-auto border-t border-term-border/50">
            <p className="text-term-dim text-xs tracking-wide">
              powered by <span className="text-term-muted">StarsBoard</span>
              <span className="mx-2">·</span>
              {new Date().toISOString().split('T')[0]}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
