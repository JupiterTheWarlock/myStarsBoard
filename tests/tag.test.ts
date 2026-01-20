import { describe, it, expect } from 'vitest';
import { groupStarsByTag } from '../src/tag/index.js';
import type { Star } from '../src/types.js';

describe('tag module', () => {
  describe('groupStarsByTag', () => {
    it('should group stars by their tags', () => {
      const stars: Star[] = [
        {
          id: 1,
          name: 'repo1',
          fullName: 'user/repo1',
          description: 'Test repo 1',
          language: 'TypeScript',
          url: 'https://github.com/user/repo1',
          stars: 100,
          updatedAt: '2024-01-01T00:00:00Z',
          tags: ['frontend', 'react'],
        },
        {
          id: 2,
          name: 'repo2',
          fullName: 'user/repo2',
          description: 'Test repo 2',
          language: 'Python',
          url: 'https://github.com/user/repo2',
          stars: 200,
          updatedAt: '2024-01-01T00:00:00Z',
          tags: ['backend', 'python'],
        },
        {
          id: 3,
          name: 'repo3',
          fullName: 'user/repo3',
          description: 'Test repo 3',
          language: 'JavaScript',
          url: 'https://github.com/user/repo3',
          stars: 150,
          updatedAt: '2024-01-01T00:00:00Z',
          tags: ['frontend', 'vue'],
        },
      ];

      const grouped = groupStarsByTag(stars);

      expect(grouped).toHaveProperty('frontend');
      expect(grouped).toHaveProperty('react');
      expect(grouped).toHaveProperty('backend');
      expect(grouped).toHaveProperty('python');
      expect(grouped).toHaveProperty('vue');

      expect(grouped.frontend).toHaveLength(2);
      expect(grouped.backend).toHaveLength(1);
    });

    it('should handle stars without tags', () => {
      const stars: Star[] = [
        {
          id: 1,
          name: 'repo1',
          fullName: 'user/repo1',
          description: 'Test repo 1',
          language: 'TypeScript',
          url: 'https://github.com/user/repo1',
          stars: 100,
          updatedAt: '2024-01-01T00:00:00Z',
          tags: [],
        },
        {
          id: 2,
          name: 'repo2',
          fullName: 'user/repo2',
          description: 'Test repo 2',
          language: 'Python',
          url: 'https://github.com/user/repo2',
          stars: 200,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const grouped = groupStarsByTag(stars);

      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const grouped = groupStarsByTag([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });
});
