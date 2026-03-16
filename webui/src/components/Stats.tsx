interface StatsProps {
  totalStars: number;
  tagCount: number;
}

function Stats({ totalStars, tagCount }: StatsProps) {
  return (
    <div className="flex gap-4 text-sm text-github-text">
      <span className="inline-flex items-center gap-1">
        <span className="text-github-accent font-semibold">{totalStars}</span>
        <span className="text-gray-500">stars</span>
      </span>
      <span className="text-gray-600">|</span>
      <span className="inline-flex items-center gap-1">
        <span className="text-github-accent font-semibold">{tagCount}</span>
        <span className="text-gray-500">tags</span>
      </span>
    </div>
  );
}

export default Stats;
