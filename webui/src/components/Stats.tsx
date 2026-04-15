interface StatsProps {
  totalStars: number;
  tagCount: number;
}

function Stats({ totalStars, tagCount }: StatsProps) {
  return (
    <div className="flex items-center gap-3 mt-3 text-sm">
      <span className="text-term-accent-bright font-bold">{totalStars}</span>
      <span className="text-term-muted">repos</span>
      <span className="text-term-dim">·</span>
      <span className="text-term-accent-bright font-bold">{tagCount}</span>
      <span className="text-term-muted">tags</span>
    </div>
  );
}

export default Stats;
