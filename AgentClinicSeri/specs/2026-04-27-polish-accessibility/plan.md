# Phase 9 Plan — Polish & Accessibility

## 1. Responsive CSS
- Add `@media` queries to `static/style.css`.
- Convert `stats-grid` to a single column on mobile.
- Allow tables to scroll horizontally on small screens to prevent layout breaking.
- Update header to stack or wrap on mobile devices.

## 2. Semantic & ARIA Audit
- Verify `src/components/Layout.tsx` uses `<header>`, `<nav>`, `<main>`, and `<footer>` (Current: Yes).
- Update `src/pages/Home.tsx` to use `<section>` for major dashboard areas.
- Ensure all images/icons (if any) have `alt` text.

## 3. Keyboard & Focus
- Add explicit `:focus` styles in `static/style.css` for links and interactive elements.
- Ensure navigation links are easily reachable via keyboard.

## 4. Error Handling
- Create `src/pages/ErrorPage.tsx` component.
- Register `app.notFound()` and `app.onError()` in `src/index.tsx`.

## 5. Visual Polish
- Standardize spacing (margins/padding) across all pages.
- Ensure "AgentClinic is open for business" slogan is properly aligned on all screen sizes.
