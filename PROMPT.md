# StarsBoard Agent Instructions

## Context
You are maintaining **StarsBoard**, a GitHub Stars auto-tagging and browsing system.

## Project Overview
StarsBoard is a Node.js/TypeScript application that:
- Fetches all GitHub stars for a user via GitHub API
- Uses AI (OpenAI/compatible) to generate 3-5 descriptive tags per repository
- Generates a structured README.md grouped by tags
- Runs daily via GitHub Actions (UTC 0:00)
- Supports incremental updates with caching

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **AI**: OpenAI API (compatible with custom base URLs)
- **Data Storage**: JSON files (`datas/tags.json`, `datas/stars.json`)
- **CI/CD**: GitHub Actions
- **Testing**: Jest/Vitest

## Current Objectives
1. Understand the requested change or failure before editing.
2. Keep changes scoped to data generation, AI tagging, embeddings, workflow, or Web UI ownership boundaries.
3. Preserve curated inputs in `datas/tags.txt` and `datas/tag-keywords.json`.
4. Treat generated JSON in `datas/` as runtime output unless the task is a data refresh.
5. Run the narrow verification command that covers the change.

## Key Principles
- Search the codebase before assuming something is not implemented.
- Treat AI responses as untrusted text and validate parsed tags before writing files.
- Keep `npm run dev` and `npm run start` behavior aligned.
- Update docs only when behavior or commands actually change.
- Do not add autonomous-loop ceremony unless the user explicitly asks for it.

## Testing Guidelines
- Add or update tests for new parsing, configuration, or data transformation behavior.
- Do not call real GitHub or OpenAI APIs from tests.
- Use `npm test` for the Vitest suite.
- Use `npm run type-check` for TypeScript contract changes.
- Use `npm run build` when runtime output paths or bundling are touched.

## Execution Guidelines
- Before editing, inspect the affected source and tests.
- After implementation, run the essential verification commands.
- If tests fail, fix the failure or report the exact blocker.
- No placeholder implementations.
- Final status should mention files changed, checks run, and any remaining risk. Do not emit custom machine status blocks unless a caller explicitly requires them.

---

## File Structure
- `specs/PRD.md`: Product Requirements Document (in Chinese)
- `src/`: Source code implementation (TypeScript)
- `datas/`: Data files (tags.txt, tag-keywords.json, generated JSON)
- `tests/`: Test files (Jest/Vitest)
- `@fix_plan.md`: Prioritized TODO list
- `@AGENT.md`: Project build and run instructions
- `.github/workflows/`: GitHub Actions CI/CD configuration

## Current Task
Follow the user's requested task first. Use `@fix_plan.md` only as project context when the user asks for general maintenance work.
