import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadTagsTxt,
  appendTagToTagsTxt,
  loadTagKeywords,
  matchTagByKeywords,
} from '../src/keyword/index.js';
import type { Star } from '../src/types.js';
import fs from 'fs/promises';
import path from 'path';

// Mock fs module
vi.mock('fs/promises');
const mockFs = fs as typeof fs & {
  mkdir: ReturnType<typeof vi.fn>;
  appendFile: ReturnType<typeof vi.fn>;
};

describe('keyword module', () => {
  const DATA_DIR = path.join(process.cwd(), 'datas');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadTagsTxt', () => {
    it('should load tags from file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(`
# Comment line
frontend
backend
ai
tool
library
# Another comment
tutorial
`);

      const tags = await loadTagsTxt();

      expect(tags).toEqual(['frontend', 'backend', 'ai', 'tool', 'library', 'tutorial']);
      expect(fs.readFile).toHaveBeenCalledWith(path.join(DATA_DIR, 'tags.txt'), 'utf-8');
    });

    it('should return default tags when file does not exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const tags = await loadTagsTxt();

      expect(tags).toEqual(['frontend', 'backend', 'ai', 'tool', 'library', 'tutorial', 'util', 'Uncategorized']);
    });

    it('should handle empty file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('');

      const tags = await loadTagsTxt();

      expect(tags).toEqual([]);
    });
  });

  describe('appendTagToTagsTxt', () => {
    it('should append new tag to file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('frontend\nbackend\n');
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.appendFile).mockResolvedValue(undefined);

      await appendTagToTagsTxt('newtag');

      expect(mockFs.mkdir).toHaveBeenCalledWith(DATA_DIR, { recursive: true });
      expect(mockFs.appendFile).toHaveBeenCalledWith(
        path.join(DATA_DIR, 'tags.txt'),
        '\nnewtag',
        'utf-8'
      );
    });

    it('should not append duplicate tag', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('frontend\nbackend\nai\n');

      await appendTagToTagsTxt('frontend');

      expect(mockFs.appendFile).not.toHaveBeenCalled();
    });

    it('should filter special characters from tag', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('frontend\nbackend\n');
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.appendFile).mockResolvedValue(undefined);

      await appendTagToTagsTxt('test#tag/slash\\backslash');

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        path.join(DATA_DIR, 'tags.txt'),
        '\ntesttagslashbackslash',
        'utf-8'
      );
    });

    it('should not append empty tag', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('frontend\nbackend\n');

      await appendTagToTagsTxt('   ###   ');

      expect(mockFs.appendFile).not.toHaveBeenCalled();
    });
  });

  describe('loadTagKeywords', () => {
    it('should load tag keywords from file', async () => {
      const mockKeywords = {
        frontend: ['react', 'vue', 'angular'],
        backend: ['express', 'nest', 'koa'],
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockKeywords));

      const keywords = await loadTagKeywords();

      expect(keywords).toEqual(mockKeywords);
    });

    it('should return default keywords when file does not exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const keywords = await loadTagKeywords();

      expect(keywords).toHaveProperty('frontend');
      expect(keywords).toHaveProperty('backend');
      expect(keywords).toHaveProperty('ai');
      expect(Array.isArray(keywords.frontend)).toBe(true);
    });
  });

  describe('matchTagByKeywords', () => {
    const tagKeywords = {
      frontend: ['react', 'vue', 'angular', 'javascript', 'typescript'],
      backend: ['express', 'nest', 'koa', 'server', 'api'],
      ai: ['machine learning', 'tensorflow', 'pytorch', 'llm', 'gpt'],
    };

    it('should match tag by repository name', () => {
      const repo: Star = {
        id: 1,
        name: 'react-admin',
        fullName: 'user/react-admin',
        description: 'Admin dashboard',
        language: 'TypeScript',
        url: 'https://github.com/user/react-admin',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      expect(match).toBe('frontend');
    });

    it('should match tag by description', () => {
      const repo: Star = {
        id: 1,
        name: 'my-app',
        fullName: 'user/my-app',
        description: 'A Vue.js application framework',
        language: 'JavaScript',
        url: 'https://github.com/user/my-app',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      expect(match).toBe('frontend');
    });

    it('should match tag by language', () => {
      const repo: Star = {
        id: 1,
        name: 'my-app',
        fullName: 'user/my-app',
        description: 'An application framework',
        language: 'TypeScript',
        url: 'https://github.com/user/my-app',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      expect(match).toBe('frontend');
    });

    it('should return null when no match found', () => {
      const repo: Star = {
        id: 1,
        name: 'unknown-repo',
        fullName: 'user/unknown-repo',
        description: 'Some unknown project',
        language: 'Assembly',
        url: 'https://github.com/user/unknown-repo',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      expect(match).toBeNull();
    });

    it('should return highest scoring tag when multiple matches', () => {
      const repo: Star = {
        id: 1,
        name: 'express-api-server',
        fullName: 'user/express-api-server',
        description: 'Backend API server',
        language: 'JavaScript',
        url: 'https://github.com/user/express-api-server',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      // Should match 'backend' with score 3 (express, api, server)
      expect(match).toBe('backend');
    });

    it('should be case insensitive', () => {
      const repo: Star = {
        id: 1,
        name: 'React-App',
        fullName: 'user/React-App',
        description: 'A REACT application',
        language: 'javascript',
        url: 'https://github.com/user/React-App',
        stars: 100,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const match = matchTagByKeywords(repo, tagKeywords);

      expect(match).toBe('frontend');
    });
  });
});
