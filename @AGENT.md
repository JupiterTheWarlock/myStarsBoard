# StarsBoard Agent Guide

## Project Setup
```bash
# Install dependencies
npm install

# Or with pnpm
pnpm install

# Or with yarn
yarn install
```

## Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - GITHUB_TOKEN: GitHub Personal Access Token
# - GITHUB_USERNAME: Your GitHub username
# - OPENAI_API_KEY: OpenAI API key (or compatible)
# - OPENAI_BASE_URL: (optional) Custom AI base URL
# - AI_MODEL: (optional) Model name, default gpt-4o
```

## Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for a specific file
npm test -- tests/github.test.ts
```

## Build Commands
```bash
# TypeScript type check
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Build and run main script
npm run start

# Run directly with tsx (development)
npm run dev

# Note: lint/format scripts are not currently defined in package.json.
```

## Running the Application
```bash
# Run the main stars processing script
npm run start

# Run with custom environment variables
GITHUB_USERNAME=myuser OPENAI_API_KEY=xxx npm run start
```

## Key Learnings
- **Build Tool**: Using `tsup` for fast TypeScript builds
- **Test Runner**: Vitest for fast unit tests with built-in coverage
- **AI Client**: OpenAI SDK (supports custom base URLs for compatible APIs)
- **GitHub API**: Using `octokit` or native fetch
- **Data Files**: All JSON files stored in `datas/` directory
- **Logging**: Date-based logs in `logs/YYYY-MM-DD.log`

## Project Structure Notes
```
src/
├── index.ts           # Main entry point
├── config/            # Configuration management
├── github/            # GitHub API client
├── ai/                # AI tag generation
├── tags/              # Tag management
├── readme/            # README generation
├── cache/             # Cache management
└── utils/             # Utility functions
```

## Feature Development Quality Standards

Use the checks that match the changed surface. Do not apply generic quality gates that are not configured in this repository.

### Testing Requirements

- Tests must validate behavior, not only call implementation details.
- Do not call real GitHub or OpenAI APIs in automated tests.
- Run `npm test` for core source changes.
- Run `npm run type-check` for TypeScript contract changes.
- Run `npm run build` when entrypoints, runtime paths, or bundling change.
- Run `npm run test:coverage` only when coverage is the actual task.

### Git Workflow Requirements

Before moving to the next feature, keep changes reviewable:

1. **Committed with Clear Messages**:
   ```bash
   git add <relevant-files>
   git commit -m "feat(module): descriptive message following conventional commits"
   ```
   - Use conventional commit format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, etc.
   - Include scope when applicable: `feat(api):`, `fix(ui):`, `test(auth):`
   - Write descriptive messages that explain WHAT changed and WHY

2. **Pushed to Remote Repository when requested**:
   ```bash
   git push origin <branch-name>
   ```
   - Do not push without user intent.
   - Ensure CI/CD pipelines pass before treating a release workflow as complete.

3. **Branch Hygiene**:
   - Prefer feature branches for significant work.
   - Branch naming convention: `feature/<feature-name>`, `fix/<issue-name>`, `docs/<doc-update>`
   - Create pull requests for all significant changes

4. **Agent Guidance**:
   - Update `PROMPT.md` or this file only when agent behavior or commands change.
   - Use `@fix_plan.md` as context, not as an automatic task queue unless the user asks for autonomous maintenance.

### Documentation Requirements

**ALL implementation documentation MUST remain synchronized with the codebase**:

1. **Code Documentation**:
   - Language-appropriate documentation (JSDoc, docstrings, etc.)
   - Update inline comments when implementation changes
   - Remove outdated comments immediately

2. **Implementation Documentation**:
   - Update relevant sections in this AGENT.md file
   - Keep build and test commands current
   - Update configuration examples when defaults change
   - Document breaking changes prominently

3. **README Updates**:
   - Keep feature lists current
   - Update setup instructions when dependencies change
   - Maintain accurate command examples
   - Update version compatibility information

4. **AGENT.md Maintenance**:
   - Add new build patterns to relevant sections
   - Update "Key Learnings" with new insights
   - Keep command examples accurate and tested
   - Document new testing patterns or quality gates

### Feature Completion Checklist

Before marking ANY feature as complete, verify:

- [ ] All tests pass with appropriate framework command
- [ ] Type checking passes for TypeScript changes
- [ ] Code formatted according to project standards
- [ ] Type checking passes (if applicable)
- [ ] Generated data was left untouched unless this was a data refresh
- [ ] Documentation updated only when commands or behavior changed
- [ ] Inline code comments updated or added
- [ ] Breaking changes documented

### Rationale

These standards ensure:
- **Quality**: High test coverage and pass rates prevent regressions
- **Traceability**: Git commits and @fix_plan.md provide clear history of changes
- **Maintainability**: Current documentation reduces onboarding time and prevents knowledge loss
- **Collaboration**: Pushed changes enable team visibility and code review
- **Reliability**: Consistent quality gates maintain production stability
- **Automation**: Ralph integration ensures continuous development practices

**Enforcement**: AI agents should automatically apply these standards to all feature development tasks without requiring explicit instruction for each task.
