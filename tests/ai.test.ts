import { describe, expect, it } from 'vitest';
import { parseGeneratedTags } from '../src/ai/tag-parser.js';

describe('ai tag parser', () => {
  it('parses plain comma-separated tags', () => {
    expect(parseGeneratedTags('frontend, tool, library', 5)).toEqual(['frontend', 'tool', 'library']);
  });

  it('filters model formatting, explanations, duplicates, and unsafe characters', () => {
    expect(
      parseGeneratedTags(
        '1. frontend\n2. tool\nfrontend\nreason: useful repo\n#ai/ml\n**library**\nvery-long-tag-name-that-is-not-a-real-classification',
        5
      )
    ).toEqual(['frontend', 'tool', 'aiml']);
  });

  it('respects the max tag count', () => {
    expect(parseGeneratedTags('a,b,c,d', 2)).toEqual(['a', 'b']);
  });
});
