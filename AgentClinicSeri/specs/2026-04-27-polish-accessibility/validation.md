# Phase 9 Validation — Polish & Accessibility

## Definition of Done

### 1. Responsive Check
- [ ] Viewport test: Shrink browser to 375px width (mobile). Content should not overflow horizontally.
- [ ] Stats cards should stack vertically on mobile.

### 2. Accessibility Check
- [ ] Keyboard test: Press `Tab` from the address bar. The focus should move clearly through all nav links and "Review Chart" links.
- [ ] Each focus state must have a visible outline or color change.

### 3. Error Handling Check
- [ ] Navigate to `http://localhost:3005/this-does-not-exist`.
- [ ] Verify the custom 404 page is displayed within the `Layout`.

### 4. Semantic Audit
- [ ] Inspect source: Ensure use of `<nav>`, `<main>`, `<header>`, `<footer>`, and `<h1>`-`<h3>` tags follows logical hierarchy.
