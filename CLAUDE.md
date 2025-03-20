# AgentGPT Development Guide

## Commands
- Build: `npm run build` (Next.js), `poetry install` (Python platform)
- Lint: `npm run lint` (JS/TS), `black .` and `isort .` (Python)
- Test: `npm run test` (all tests), `npm run test -- -t "test name"` (single test)
- Dev: `npm run dev` (Next.js), `cd platform && python -m reworkd_platform` (Python)

## Code Style
- **TypeScript**: Use strict typing, organize imports (builtin → external → internal)
- **Python**: Follow Black formatting, isort for imports, use strict mypy typing
- **Line Length**: 100 characters
- **Formatting**: Prettier for JS/TS, Black for Python
- **Naming**: PascalCase for components/classes, camelCase for functions/variables
- **React**: Functional components with hooks, avoid class components
- **Error Handling**: Use try/catch for async operations, proper error types

## Project Structure
- Next.js frontend in `/next`
- Python backend in `/platform`
- Database setup in `/db`
- CLI tools in `/cli`

## Testing
- Jest for JavaScript/TypeScript
- pytest for Python
- Test files: `__tests__/*.test.ts`, `tests/test_*.py`