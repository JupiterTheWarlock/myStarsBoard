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

interface TagSectionProps {
  tag: string;
  repos: Star[];
  isExpanded: boolean;
  onToggle: () => void;
}

function TagSection({ tag, repos, isExpanded, onToggle }: TagSectionProps) {
  const sortedRepos = [...repos].sort((a, b) => b.stars - a.stars);

  return (
    <div className="bg-github-dark border border-github-border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-github-border/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-white">{tag}</span>
          <span className="text-gray-500 text-sm">({repos.length})</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-github-border px-4 py-3 space-y-2">
          {sortedRepos.map((repo) => {
            const owner = repo.fullName.split('/')[0];
            const avatarUrl = `https://github.com/${owner}.png?size=20`;

            return (
              <div key={repo.id} className="flex items-start gap-3 py-2">
                <img
                  src={avatarUrl}
                  alt={owner}
                  className="w-5 h-5 rounded-full mt-1"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-github-accent hover:underline font-medium"
                  >
                    {repo.name}
                  </a>
                  {repo.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {repo.stars.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TagSection;
