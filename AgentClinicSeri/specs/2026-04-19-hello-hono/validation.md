# Phase 1 Validation — Hello Hono

## Definition of Done

### 1. TypeScript Validation
- `npm run typecheck` must exit with code 0.
- `tsconfig.json` must have `strict: true`.

### 2. Functional Validation
- `npm run dev` starts the server on port 3000.
- `curl -s http://localhost:3000` returns an HTML document.
- The HTML contains `<h1>AgentClinic</h1>`.
- The HTML contains the text `AgentClinic is open for business`.
- The HTML links to `/static/style.css`.
- `curl -s http://localhost:3000/static/style.css` returns the CSS file.

### 3. Dependency Check
- `package.json` has `hono` pinned (no `^` or `~`).
- `tsx` is present in `devDependencies`.

## Why this matters
This validation ensures that our development loop is solid. If we can't serve a basic page with correct types and styles, we shouldn't move on to complex features like databases or ailment tracking.
