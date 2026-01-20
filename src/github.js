import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchStars() {
  const { GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    throw new Error('Missing GITHUB_TOKEN or GITHUB_USERNAME environment variable');
  }

  const stars = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${GITHUB_API_BASE}/user/starred?page=${page}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      hasMore = false;
    } else {
      stars.push(...data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || '',
        url: repo.html_url,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at
      })));
      page++;
    }
  }

  return stars;
}
