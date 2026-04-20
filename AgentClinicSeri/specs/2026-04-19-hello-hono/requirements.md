# Phase 1 Requirements — Hello Hono

## Scope

Install and configure Hono with a `tsx` dev server. Expose a single `/` route that renders a minimal HTML home page via Hono JSX. Confirm TypeScript types work end-to-end.

## Out of Scope

- No database integration (Phase 3)
- No complex business logic (Ailments, Therapies, etc.)
- No automated test suite (Vitest deferred)

## Decisions

### Pin Hono version
Record the exact Hono version in `package.json` with no range prefix (e.g., `"hono": "4.1.0"`). This prevents unexpected breaking changes during development.

### Enforce strict TypeScript
`tsconfig.json` must include `"strict": true`. This ensures type safety from the beginning, which is a core requirement for Mary and helps catch bugs early.

### Use Hono JSX for Server-Side Rendering
Instead of returning plain strings, we will use Hono's built-in JSX support. This keeps the stack simple (no React) while allowing us to build components like functions, which is more maintainable as the project grows.

## Context

This phase is the "plumbing" phase. We are proving that our tech stack (Node, TypeScript, Hono, tsx) is correctly configured and that we can serve a basic web page. 

The home page will be a simple "Welcome" page for AgentClinic, establishing the visual presence that Steve wants, even if it's very basic for now.

## Stakeholder Notes

- **Mary:** Needs TypeScript end-to-end. We'll satisfy this with `strict: true` and a `typecheck` script.
- **Susan:** Needs the structure for agents/ailments. We are setting the foundation for these pages.
- **Steve:** Needs an attractive site. We'll start with a basic CSS file and a layout component.
