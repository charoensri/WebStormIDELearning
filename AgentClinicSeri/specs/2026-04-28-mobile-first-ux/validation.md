# Phase 11 — Mobile-First UX Validation

## Automated Tests
- [ ] Run `npm run typecheck` to ensure CSS variable additions or JS logic didn't break TS.
- [ ] (Optional) Add a basic Playwright/Cypress test for viewport resizing.

## Manual UI Checklist (Mobile Viewport)
- [x] **Home:** Stats cards stack vertically on small screens.
- [x] **Navigation:** Hamburger menu appears, opens on click, and links work.
- [x] **Tables:** Tables scroll horizontally and do not push the screen wider than 100vw.
- [x] **Detail Page:** Patient ID does not break the layout (wraps or truncates).
- [x] **Analytics:** Charts shrink to fit without losing labels.

## Device Compatibility
- [ ] Chrome DevTools (iPhone SE emulator)
- [ ] Chrome DevTools (iPad Air emulator)
- [ ] Real device testing (if available)
