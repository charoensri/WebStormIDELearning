# Phase 12 — Component Architecture Requirements

## Context
The `Layout.tsx` file has grown significantly, containing the base HTML structure, header navigation, main content wrapper, footer, and several embedded scripts for mobile menu toggle and table sorting. To improve maintainability and follow React/JSX best practices, these sections should be modularized.

## Goals
1.  **Modularity:** Break down the monolithic `Layout.tsx` into smaller, focused components.
2.  **Maintainability:** Easier to update navigation or footer logic without touching the entire layout.
3.  **Readability:** Simplify the `Layout` component to focus on the document structure.

## Requirements
- The `header` element and its contents (branding, mobile toggle, navigation) must be moved to `src/components/Header.tsx`.
- The `footer` element and its contents must be moved to `src/components/Footer.tsx`.
- The `main` element wrapper should be its own component or clearly managed within the layout to ensure consistent spacing/layout for children.
- Embedded JavaScript logic related to specific components (e.g., mobile menu toggle) should ideally stay close to the component or be managed cleanly.
- All existing functionality (SSE, mobile menu, table sorting) must remain intact.

## Success Criteria
- [ ] `src/components/Header.tsx` exists and is used in `Layout`.
- [ ] `src/components/Footer.tsx` exists and is used in `Layout`.
- [ ] `Layout.tsx` is primarily responsible for the HTML document shell (`<html>`, `<head>`, `<body>`).
- [ ] The application remains fully functional with no regressions in UI or behavior.
