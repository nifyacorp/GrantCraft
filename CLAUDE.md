# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# GrantCraft Development Guide

## Build Commands
- **Frontend (Next.js)**: `cd next && npm run dev`
- **Backend (FastAPI)**: `cd platform && poetry run uvicorn reworkd_platform.__main__:app --reload`
- **Build**: `cd next && npm run build`
- **Lint**: `cd next && npm run lint`
- **Test**: `cd next && npm run test`
- **Run single test**: `cd next && npx jest path/to/test.ts`
- **Python Tests**: `cd platform && poetry run pytest`

## Code Style Guide
- **TypeScript**: Strong typing with strict mode, PascalCase for components/types, camelCase for variables/functions
- **Formatting**: Prettier with 100 character line width, configured in prettier.config.cjs
- **Imports**: Group by: builtin → external → internal → sibling/parent, alphabetized within groups
- **Components**: Follow existing patterns in /next/src/components, use Tailwind CSS classes
- **Error Handling**: Use structured error handling with specific error types/messages
- **Python**: Black formatting, isort for imports, mypy for type checking (configured in pyproject.toml)
- **Testing**: Jest for frontend, pytest for backend with pytest-asyncio for async tests
- **State Management**: Use zustand for global state management

Always maintain code consistency with surrounding code. Follow existing patterns in the codebase.