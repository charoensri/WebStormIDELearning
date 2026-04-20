# Phase 1 Plan — Hello Hono

This plan includes detailed steps to set up the foundation of AgentClinic. We are using Hono because it's lightweight and has great TypeScript support.

## Group 1 — Package Setup
*Goal: Prepare the environment with necessary dependencies.*

1. **Install Hono:** `npm install hono@4.1.0` (pinning the version for stability).
2. **Install Node Server & tsx:** `npm install @hono/node-server tsx --save-dev`. `@hono/node-server` is needed to run Hono on Node.js, and `tsx` allows us to run TypeScript files directly without a separate build step during development.
3. **Verify TSConfig:** Ensure `AgentClinicSeri/tsconfig.json` has `"strict": true` and `"jsx": "react"`, `"jsxImportSource": "hono/jsx"`. This tells TypeScript how to handle our Hono JSX components.

## Group 2 — Core Components & Layout
*Goal: Create reusable UI pieces.*

4. **Create Base CSS:** Create `static/style.css` with basic resets and typography.
5. **Create Layout Component:** Create `src/components/Layout.tsx`. This will be our "wrapper" for all pages, containing the `<html>`, `<head>`, and `<body>` tags. It will include a `<Header>` and `<Footer>`.
6. **Create Page Components:** Create `src/pages/Home.tsx` which uses the `Layout` component to display "AgentClinic is open for business".

## Group 3 — Application Entry Point
*Goal: Wire everything together.*

7. **Initialize Hono App:** Update `src/index.tsx` (renamed from `.ts` to support JSX).
8. **Serve Static Files:** Configure Hono to serve the `static/` directory so our CSS is accessible.
9. **Define Main Route:** Set up `app.get('/', ...)` to render the `Home` page component.

## Group 4 — Development Scripts
*Goal: Make it easy to run and check the project.*

10. **Add Dev Script:** Add `"dev": "tsx watch src/index.tsx"` to `package.json`. The `watch` flag will automatically restart the server when we change files.
11. **Add Typecheck Script:** Add `"typecheck": "tsc --noEmit"` to `package.json`. This lets us verify our types are correct without generating any files.

## Group 5 — Validation
*Goal: Ensure everything works as expected.*

12. **Type Check:** Run `npm run typecheck`.
13. **Manual Test:** Run `npm run dev` and visit `http://localhost:3000` to see the "Hello Hono" page.
