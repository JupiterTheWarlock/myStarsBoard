import { useState, useMemo, useEffect } from 'react';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';
import TagSidebar from './components/TagSidebar';
import RepoCard from './components/RepoCard';

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
}

function App({ initialData, title, favicon }: AppProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = `★ ${title}`;
  }, [title]);

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

    // Filter by search query
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.language?.toLowerCase().includes(query) ||
      repo.fullName.toLowerCase().includes(query)
    );
  }, [initialData, selectedTag, searchQuery]);

  const currentTagCount = selectedTag && initialData[selectedTag]
    ? initialData[selectedTag].length
    : totalRepos;

  return (
    <div className="h-screen flex flex-col bg-term-bg font-terminal scanlines">
      {/* Header */}
      <header className="shrink-0 px-4 pt-4 pb-3 border-b border-term-border">
        <div className="max-w-[1600px] mx-auto flex items-baseline justify-between flex-wrap gap-x-4 gap-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            <span className="text-term-accent glow-accent">★</span>{' '}
            <span className="text-term-text">{title}</span>
          </h1>
          <Stats totalStars={totalRepos} tagCount={tags.length} />
        </div>
        <div className="max-w-[1600px] mx-auto mt-3">
          <SearchBar query={searchQuery} onChange={setSearchQuery} />
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
