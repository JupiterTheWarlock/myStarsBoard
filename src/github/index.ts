import { config } from '../config/index.js';
import { withApiRetry } from '../utils/retry.js';
import type { Star } from '../types.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Response from GitHub API for starred repositories
 */
interface GitHubStarResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  updated_at: string;
}

/**
 * Fetches a single page of starred repositories with retry logic
 * @param page - Page number to fetch
 * @returns Array of starred repositories
 */
async function fetchStarsPage(page: number): Promise<GitHubStarResponse[]> {
  const url = `${GITHUB_API_BASE}/user/starred?page=${page}&per_page=100`;

  return withApiRetry(async () => {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }, `GitHub API page ${page}`);
}

/**
 * Fetches all starred repositories for the authenticated user
 * @returns Array of starred repositories
 */
export async function fetchStars(): Promise<Star[]> {
  const stars: Star[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await fetchStarsPage(page);

      if (data.length === 0) {
        hasMore = false;
      } else {
        stars.push(
          ...data.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || '',
            language: repo.language || '',
            url: repo.html_url,
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
          }))
        );
        page++;
      }
    } catch (error) {
      console.error(`Failed to fetch stars page ${page}:`, (error as Error).message);
      throw new Error(`Failed to fetch all stars after ${page} pages: ${(error as Error).message}`);
    }
  }

  return stars;
}
