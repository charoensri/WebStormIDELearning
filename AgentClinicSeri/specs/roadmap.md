# Roadmap

Phases are intentionally small — each one is a shippable slice of work, independently reviewable and testable.

**Last Updated:** 2026-04-27 22:54:40 by Gemini CLI

---

## Phase 1 — Hello Hono [DONE]
- [x] Install and configure Hono with `tsx` dev server
- [x] Single `/` route returning "AgentClinic is open for business"
- [x] Confirm TypeScript types work end-to-end

## Phase 2 — Base Layout [DONE]
- [x] Server-side JSX layout component (header, nav, main, footer)
- [x] Basic CSS (custom properties, reset, typography)
- [x] All routes render inside the shared layout

## Phase 3 — Agent List [DONE]
- [x] SQLite database + first migration (`agents` table)
- [x] Seed a handful of fictional agents
- [x] `/agents` page listing all agents (implemented as `/patients`)

## Phase 4 — Agent Detail [DONE]
- [x] `/agents/:id` page showing a single agent's profile
- [x] Name, model type, current status, presenting complaints

## Phase 5 — Ailments Catalog [DONE]
- [x] `ailments` table + seed data (e.g., "context-window claustrophobia", "prompt fatigue")
- [x] `/ailments` list page
- [x] Link agents to one or more ailments

## Phase 6 — Therapies Catalog [DONE]
- [x] `therapies` table + seed data
- [x] `/therapies` list page
- [x] Map ailments → recommended therapies

## Phase 7 — Appointment Booking [DONE]
- [x] `appointments` table (agent, therapist, datetime, status) - (Implemented as `visits` with full diagnostic pipeline)
- [x] Form to book an appointment from an agent's detail page
- [x] Basic validation and confirmation page

## Phase 8 — Staff Dashboard [DONE]
- [x] `/dashboard` with summary counts: agents, open appointments, ailments in-flight
- [x] Simple table views for staff to manage records
- [x] Mary's dashboard is now real

## Phase 9 — Polish & Accessibility [DONE]
- [x] Responsive layout for Steve's modern-browser requirement
- [x] Semantic HTML audit
- [x] Keyboard navigation and focus styles

## Phase 10 — Hardening [IN PROGRESS]
- [x] Error pages (404, 500)
- [ ] Input sanitization on all forms
- [ ] Basic logging middleware

## Phase 11 — Mobile-First UX
- [ ] Responsive navigation (hamburger menu or bottom bar)
- [ ] Touch-friendly action targets (min 44px)
- [ ] Optimized data density for small screens (card-based lists)
- [ ] Viewport-specific layouts for complex analytics charts

---

Later phases (not yet planned): auth, email notifications, therapist profiles, reporting.
