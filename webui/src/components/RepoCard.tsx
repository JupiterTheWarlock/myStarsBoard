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

interface RepoCardProps {
  repo: Star;
  animationDelay?: number;
}

function formatStars(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toString();
}

function RepoCard({ repo, animationDelay = 0 }: RepoCardProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="term-animate opacity-0 animate-term-print flex flex-col border border-term-border hover:border-term-accent/50 transition-colors group"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Title bar */}
      <div className="border-b border-term-border/60 px-3 py-1.5 flex items-center gap-1.5 min-w-0 bg-term-surface/40">
        <span className="text-term-accent-glow glow-star text-xs shrink-0">★</span>
        <span className="text-term-accent-bright group-hover:text-term-accent-glow transition-colors text-xs font-bold truncate">
          {repo.fullName}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {repo.description ? (
          <p className="text-term-muted text-xs leading-relaxed line-clamp-2">
            {repo.description}
          </p>
        ) : (
          <p className="text-term-dim text-xs italic">no description</p>
        )}

        {/* Meta footer */}
        <div className="flex items-center gap-2 text-xs flex-wrap mt-auto">
          <span className="text-term-accent tabular-nums">{formatStars(repo.stars)}★</span>
          {repo.language && (
            <>
              <span className="text-term-dim">·</span>
              <span className="text-term-dim">[{repo.language}]</span>
            </>
          )}
          {repo.tags && repo.tags.length > 0 && (
            <>
              <span className="text-term-dim">·</span>
              <span className="text-term-dim">
                {repo.tags
                  .filter((tag) => tag !== repo.language)
                  .map((tag, i) => (
                    <span key={i}>[{tag}]</span>
                  ))}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

export default RepoCard;
