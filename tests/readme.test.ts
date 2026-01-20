import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../src/readme/index.js';
import type { StarsByTag } from '../src/types.js';

describe('readme module', () => {
  describe('generateMarkdown', () => {
    it('should generate markdown with grouped stars', async () => {
      const groupedStars: StarsByTag = {
        frontend: [
          {
            id: 1,
            name: 'react',
            fullName: 'user/react',
            description: 'A JavaScript library for building UIs',
            language: 'JavaScript',
            url: 'https://github.com/user/react',
            stars: 200,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
          {
            id: 2,
            name: 'vue',
            fullName: 'user/vue',
            description: 'The Progressive JavaScript Framework',
            language: 'JavaScript',
            url: 'https://github.com/user/vue',
            stars: 100,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
        ],
        backend: [
          {
            id: 3,
            name: 'express',
            fullName: 'user/express',
            description: 'Fast, unopinionated web framework',
            language: 'JavaScript',
            url: 'https://github.com/user/express',
            stars: 60,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['backend'],
          },
        ],
      };

      const markdown = await generateMarkdown(groupedStars, 'testuser');

      expect(markdown).toContain("# ⭐ testuser's GitHub Stars");
      expect(markdown).toContain('## frontend');
      expect(markdown).toContain('## backend');
      expect(markdown).toContain('[react](https://github.com/user/react)');
      expect(markdown).toContain('[vue](https://github.com/user/vue)');
      expect(markdown).toContain('[express](https://github.com/user/express)');
    });

    it('should sort repos by star count descending within each tag', async () => {
      const groupedStars: StarsByTag = {
        frontend: [
          {
            id: 1,
            name: 'low-stars',
            fullName: 'user/low-stars',
            description: 'Low star repo',
            language: 'JavaScript',
            url: 'https://github.com/user/low-stars',
            stars: 10,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
          {
            id: 2,
            name: 'high-stars',
            fullName: 'user/high-stars',
            description: 'High star repo',
            language: 'JavaScript',
            url: 'https://github.com/user/high-stars',
            stars: 1000,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
          {
            id: 3,
            name: 'mid-stars',
            fullName: 'user/mid-stars',
            description: 'Mid star repo',
            language: 'JavaScript',
            url: 'https://github.com/user/mid-stars',
            stars: 500,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
        ],
      };

      const markdown = await generateMarkdown(groupedStars, 'testuser');

      // Find position of each repo in markdown
      const highStarsPos = markdown.indexOf('high-stars');
      const midStarsPos = markdown.indexOf('mid-stars');
      const lowStarsPos = markdown.indexOf('low-stars');

      expect(highStarsPos).toBeLessThan(midStarsPos);
      expect(midStarsPos).toBeLessThan(lowStarsPos);
    });

    it('should skip empty tag sections', async () => {
      const groupedStars: StarsByTag = {
        frontend: [
          {
            id: 1,
            name: 'react',
            fullName: 'user/react',
            description: 'A JavaScript library',
            language: 'JavaScript',
            url: 'https://github.com/user/react',
            stars: 200,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['frontend'],
          },
        ],
        backend: [],
      };

      const markdown = await generateMarkdown(groupedStars, 'testuser');

      expect(markdown).toContain('## frontend');
      expect(markdown).not.toContain('## backend');
    });

    it('should include language badge when available', async () => {
      const groupedStars: StarsByTag = {
        tools: [
          {
            id: 1,
            name: 'tool',
            fullName: 'user/tool',
            description: 'A useful tool',
            language: 'TypeScript',
            url: 'https://github.com/user/tool',
            stars: 100,
            updatedAt: '2024-01-01T00:00:00Z',
            tags: ['tools'],
          },
        ],
      };

      const markdown = await generateMarkdown(groupedStars, 'testuser');

      expect(markdown).toContain('`TypeScript`');
    });
  });
});
