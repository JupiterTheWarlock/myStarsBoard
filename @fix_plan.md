# StarsBoard Development Plan

## High Priority - Core MVP

- [x] Set up TypeScript project structure with proper build system
- [x] Define core TypeScript interfaces/types (Star, Tag, Config, etc.)
- [x] Implement GitHub API client for fetching stars
- [x] Implement AI tag generation service with OpenAI client
- [x] Implement tag management (load/save tags.txt, tags.json)
- [x] Implement README.md generation from tagged data
- [x] Create basic test framework and initial tests

## Medium Priority - Features & Integration

- [x] Implement incremental update logic (compare cache vs API) - via loadStarsWithTags()
- [x] Add keyword-based pre-matching for AI suggestions
- [x] Implement error handling with retry logic (GitHub & AI APIs)
- [ ] Add logging system with date-based log files
- [x] Create GitHub Actions workflow (daily trigger + manual dispatch)
- [x] Implement batch processing for AI requests
- [x] Add configuration management from environment variables

## Low Priority - Polish & Documentation

- [x] Create .env.example with all configuration options
- [x] Write comprehensive README.md for users
- [x] Add default datas/tags.txt and datas/tag-keywords.json
- [ ] Implement atomic file updates (temp file → rename)
- [x] Add断点续传 (resume from checkpoint) functionality - via stars-with-tags.json cache
- [x] Create Chinese comments in GitHub Actions workflow
- [ ] Performance optimization for large star collections

## Template Delivery Checklist

Based on PRD Section 10:

- [x] Complete source code (`src/`)
- [x] `.env.example` environment variable template
- [x] `datas/tags.txt` default tag list
- [x] `datas/tag-keywords.json` default keyword mapping
- [x] `.github/workflows/daily-stars.yml` CI/CD with Chinese comments
- [x] `README.md` project documentation
- [x] `.gitignore` configuration
- [x] `package.json` dependencies
- [x] Installation/configuration documentation

## Completed

- [x] Project initialization
- [x] PRD documentation (specs/PRD.md)
- [x] Ralph configuration (PROMPT.md, @AGENT.md, @fix_plan.md)
- [x] TypeScript project structure with tsup, vitest
- [x] Core types definition
- [x] GitHub API client with retry logic
- [x] AI tag generation with batch processing and retry logic
- [x] Tag management module
- [x] README generation module
- [x] Configuration management
- [x] Basic test framework with vitest
- [x] .env.example template
- [x] Keyword-based pre-matching for AI suggestions
- [x] Default data files (tags.txt, tag-keywords.json)
- [x] README sections sorted by tags.txt order
- [x] Error handling with retry logic for API calls
- [x] GitHub Actions workflow with Chinese comments
- [x] Comprehensive README.md for users
- [x] .gitignore configuration

## Notes

**Key Design Decisions from PRD:**
- Use 3-5 tags per repository (configurable via TAG_COUNT_MIN/MAX)
- Enable new tag creation by default (ENABLE_NEW_TAGS=true)
- Sort sections by tag order in tags.txt
- Sort repos within sections by star count (descending)
- Skip empty sections in README output
- Support custom AI base URLs (for OpenAI-compatible APIs)

**Data Files (.gitignore these):**
- `datas/tags.json` - runtime generated
- `datas/stars.json` - runtime generated
- `datas/stars-with-tags.json` - resume checkpoint cache

**Data Files (commit these):**
- `datas/tags.txt` - user editable + AI appends
- `datas/tag-keywords.json` - user configurable

**AI Tag Logic Summary:**
1. Keyword pre-match → suggested tag
2. AI analyzes repo + existing tags + suggestion
3. If suitable tag exists → use it
4. If ENABLE_NEW_TAGS=true → create new tag (append to tags.txt)
5. If ENABLE_NEW_TAGS=false → use "Uncategorized"

## Remaining Tasks (Optional)

1. Add logging system with date-based log files
2. Implement atomic file updates (temp file → rename)
3. Performance optimization for large star collections
- [x] All core MVP and template delivery tasks completed
