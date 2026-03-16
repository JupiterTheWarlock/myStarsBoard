import { useState, useMemo } from 'react';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';
import TagSection from './components/TagSection';

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
  username: string;
}

function App({ initialData, username }: AppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const totalStars = Object.values(initialData).reduce((sum, repos) => sum + repos.length, 0);
    const tagCount = Object.keys(initialData).length;
    return { totalStars, tagCount };
  }, [initialData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return initialData;

    const query = searchQuery.toLowerCase();
    const filtered: StarsByTag = {};

    for (const [tag, repos] of Object.entries(initialData)) {
      const matchedRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query) ||
        repo.fullName.toLowerCase().includes(query)
      );

      if (matchedRepos.length > 0) {
        filtered[tag] = matchedRepos;
      }
    }

    return filtered;
  }, [initialData, searchQuery]);

  const toggleTag = (tag: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTags(new Set(Object.keys(filteredData)));
  };

  const collapseAll = () => {
    setExpandedTags(new Set());
  };

  return (
    <div className="min-h-screen bg-github-darker">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ⭐ {username}'s GitHub Stars
          </h1>
          <Stats {...stats} />
        </header>

        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />

        <div className="space-y-4 mt-6">
          {Object.keys(filteredData).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No repositories found matching "{searchQuery}"
            </div>
          ) : (
            Object.entries(filteredData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([tag, repos]) => (
                <TagSection
                  key={tag}
                  tag={tag}
                  repos={repos}
                  isExpanded={expandedTags.has(tag)}
                  onToggle={() => toggleTag(tag)}
                />
              ))
          )}
        </div>

        <footer className="mt-12 pt-8 border-t border-github-border text-center text-gray-500 text-sm">
          <p>Powered by StarsBoard • Last updated: {new Date().toISOString().split('T')[0]}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
