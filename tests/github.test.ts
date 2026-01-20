import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStars } from '../src/github/index.js';
import type { Star } from '../src/types.js';

// Mock the retry module
vi.mock('../src/utils/retry.js', () => ({
  withApiRetry: async (fn: () => unknown) => fn(),
}));

// Mock the config module
vi.mock('../src/config/index.js', () => ({
  config: {
    githubToken: 'test-token',
    githubUsername: 'testuser',
    openaiApiKey: 'test-api-key',
    openaiBaseUrl: 'https://api.openai.com/v1',
    aiModel: 'gpt-4o',
    tagCountMin: 3,
    tagCountMax: 5,
    enableNewTags: true,
    enableThinking: false,
    batchSize: 5,
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('github module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchStars', () => {
    it('should fetch all starred repositories', async () => {
      const mockResponse1 = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          description: 'First repository',
          language: 'TypeScript',
          html_url: 'https://github.com/user/repo1',
          stargazers_count: 100,
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'repo2',
          full_name: 'user/repo2',
          description: 'Second repository',
          language: 'JavaScript',
          html_url: 'https://github.com/user/repo2',
          stargazers_count: 200,
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse2 = [
        {
          id: 3,
          name: 'repo3',
          full_name: 'user/repo3',
          description: 'Third repository',
          language: 'Python',
          html_url: 'https://github.com/user/repo3',
          stargazers_count: 300,
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      const stars = await fetchStars();

      expect(stars).toHaveLength(3);
      expect(stars[0]).toEqual({
        id: 1,
        name: 'repo1',
        fullName: 'user/repo1',
        description: 'First repository',
        language: 'TypeScript',
        url: 'https://github.com/user/repo1',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle empty response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const stars = await fetchStars();

      expect(stars).toHaveLength(0);
    });

    it('should handle null description and language', async () => {
      const mockResponse = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          description: null,
          language: null,
          html_url: 'https://github.com/user/repo1',
          stargazers_count: 100,
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      const stars = await fetchStars();

      expect(stars[0].description).toBe('');
      expect(stars[0].language).toBe('');
    });

    it('should make requests with correct headers', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      await fetchStars();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/starred?page=1&per_page=100',
        {
          headers: {
            'Authorization': 'token test-token',
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
    });

    it('should paginate through results', async () => {
      const page1 = [
        { id: 1, name: 'repo1', full_name: 'user/repo1', description: '', language: 'TypeScript', html_url: 'https://github.com/user/repo1', stargazers_count: 100, updated_at: '2024-01-01T00:00:00Z' },
      ];

      const page2 = [
        { id: 2, name: 'repo2', full_name: 'user/repo2', description: '', language: 'JavaScript', html_url: 'https://github.com/user/repo2', stargazers_count: 200, updated_at: '2024-01-01T00:00:00Z' },
      ];

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => page1 } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => page2 } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);

      await fetchStars();

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/starred?page=1&per_page=100',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/starred?page=2&per_page=100',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/starred?page=3&per_page=100',
        expect.any(Object)
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(fetchStars()).rejects.toThrow('Failed to fetch all stars');
    });

    it('should transform API response to Star type', async () => {
      const mockResponse = [
        {
          id: 12345,
          name: 'test-repo',
          full_name: 'owner/test-repo',
          description: 'A test repository',
          language: 'Python',
          html_url: 'https://github.com/owner/test-repo',
          stargazers_count: 9999,
          updated_at: '2024-06-15T12:30:45Z',
        },
      ];

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      const stars = await fetchStars();

      expect(stars[0]).toEqual({
        id: 12345,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        description: 'A test repository',
        language: 'Python',
        url: 'https://github.com/owner/test-repo',
        stars: 9999,
        updatedAt: '2024-06-15T12:30:45Z',
      });
    });
  });
});
