/**
 * Converts a model response into bounded, plain tag names.
 */
export function parseGeneratedTags(content: string, maxTags: number): string[] {
  const seen = new Set<string>();

  return content
    .split(/[,，\n]/)
    .map((tag) =>
      tag
        .trim()
        .replace(/^[-*]\s*/, '')
        .replace(/^\d+[.)、]\s*/, '')
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/[#\/\\]/g, '')
        .trim()
    )
    .filter((tag) => tag.length > 0)
    .filter((tag) => !tag.includes('**') && !tag.includes('：') && !tag.includes(':'))
    .filter((tag) => tag.length <= 32)
    .filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    })
    .slice(0, maxTags);
}
